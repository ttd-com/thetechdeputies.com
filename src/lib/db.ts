import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use a persistent location for the database
const dbPath = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'thetechdeputies.db')
    : path.join(process.cwd(), 'data', 'database.sqlite');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    email_verified INTEGER DEFAULT 0,
    acuity_client_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Email verification tokens
  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Password reset tokens
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Rate limiting for password reset
  CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    attempts INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_address, endpoint)
  );

  -- Site settings (API keys stored here, encrypted)
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    encrypted INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Sessions table for auth
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Gift cards table
  CREATE TABLE IF NOT EXISTS gift_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    original_amount INTEGER NOT NULL,
    remaining_amount INTEGER NOT NULL,
    purchaser_email TEXT NOT NULL,
    purchaser_name TEXT,
    recipient_email TEXT,
    recipient_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'redeemed', 'expired', 'cancelled')),
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Gift card transactions
  CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gift_card_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id) ON DELETE CASCADE
  );

  -- Course purchases
  CREATE TABLE IF NOT EXISTS course_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_slug TEXT NOT NULL,
    amount_paid INTEGER NOT NULL,
    gift_card_code TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'refunded', 'expired')),
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_slug)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
  CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
  CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser ON gift_cards(purchaser_email);
  CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient ON gift_cards(recipient_email);
  CREATE INDEX IF NOT EXISTS idx_course_purchases_user ON course_purchases(user_id);
  CREATE INDEX IF NOT EXISTS idx_course_purchases_slug ON course_purchases(course_slug);
`);

export default db;

// User operations
export interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string | null;
    role: 'user' | 'admin';
    email_verified: number;
    acuity_client_id: string | null;
    created_at: string;
    updated_at: string;
}

export function getUserByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(email: string, passwordHash: string, name?: string): User {
    // First user becomes admin
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const role = userCount.count === 0 ? 'admin' : 'user';

    const result = db.prepare(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).run(email, passwordHash, name || null, role);

    return getUserById(result.lastInsertRowid as number)!;
}

export function updateUserPassword(userId: number, passwordHash: string): void {
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(passwordHash, userId);
}

export function getAllUsers(): User[] {
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
}

// Password reset token operations
export function createPasswordResetToken(userId: number, token: string, expiresAt: Date): void {
    // Invalidate existing tokens for this user
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(userId);

    db.prepare(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).run(userId, token, expiresAt.toISOString());
}

export function getPasswordResetToken(token: string): { user_id: number; expires_at: string; used: number } | undefined {
    return db.prepare(
        'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?'
    ).get(token) as { user_id: number; expires_at: string; used: number } | undefined;
}

export function markTokenAsUsed(token: string): void {
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);
}

// Rate limiting
export function checkRateLimit(ipAddress: string, endpoint: string, maxAttempts: number, windowMinutes: number): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    const existing = db.prepare(
        'SELECT attempts, window_start FROM rate_limits WHERE ip_address = ? AND endpoint = ?'
    ).get(ipAddress, endpoint) as { attempts: number; window_start: string } | undefined;

    if (!existing) {
        db.prepare(
            'INSERT INTO rate_limits (ip_address, endpoint, attempts, window_start) VALUES (?, ?, 1, ?)'
        ).run(ipAddress, endpoint, now.toISOString());
        return true;
    }

    const existingWindowStart = new Date(existing.window_start);

    if (existingWindowStart < windowStart) {
        // Reset the window
        db.prepare(
            'UPDATE rate_limits SET attempts = 1, window_start = ? WHERE ip_address = ? AND endpoint = ?'
        ).run(now.toISOString(), ipAddress, endpoint);
        return true;
    }

    if (existing.attempts >= maxAttempts) {
        return false;
    }

    db.prepare(
        'UPDATE rate_limits SET attempts = attempts + 1 WHERE ip_address = ? AND endpoint = ?'
    ).run(ipAddress, endpoint);
    return true;
}

// Settings operations
export function getSetting(key: string): string | null {
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return result?.value || null;
}

export function setSetting(key: string, value: string, encrypted: boolean = false): void {
    db.prepare(
        'INSERT OR REPLACE INTO settings (key, value, encrypted, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(key, value, encrypted ? 1 : 0);
}

export function getAllSettings(): { key: string; value: string; encrypted: number }[] {
    return db.prepare('SELECT key, value, encrypted FROM settings').all() as { key: string; value: string; encrypted: number }[];
}

// Session operations (for custom session store)
export function createSession(id: string, userId: number, expiresAt: Date): void {
    db.prepare(
        'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).run(id, userId, expiresAt.toISOString());
}

export function getSession(id: string): { user_id: number; expires_at: string } | undefined {
    return db.prepare(
        'SELECT user_id, expires_at FROM sessions WHERE id = ?'
    ).get(id) as { user_id: number; expires_at: string } | undefined;
}

export function deleteSession(id: string): void {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function deleteUserSessions(userId: number): void {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export function cleanExpiredSessions(): void {
    db.prepare('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP').run();
}

// Email verification operations
export function createEmailVerificationToken(userId: number, token: string, expiresAt: Date): void {
    // Invalidate existing tokens for this user
    db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(userId);

    db.prepare(
        'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).run(userId, token, expiresAt.toISOString());
}

export function getEmailVerificationToken(token: string): { user_id: number; expires_at: string } | undefined {
    return db.prepare(
        'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ?'
    ).get(token) as { user_id: number; expires_at: string } | undefined;
}

export function verifyUserEmail(userId: number): void {
    db.prepare('UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(userId);
    db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(userId);
}

// Gift card operations
export interface GiftCard {
    id: number;
    code: string;
    original_amount: number;
    remaining_amount: number;
    purchaser_email: string;
    purchaser_name: string | null;
    recipient_email: string | null;
    recipient_name: string | null;
    message: string | null;
    status: 'active' | 'redeemed' | 'expired' | 'cancelled';
    purchased_at: string;
    expires_at: string | null;
    created_at: string;
}

export interface GiftCardTransaction {
    id: number;
    gift_card_id: number;
    amount: number;
    description: string | null;
    created_at: string;
}

export function generateGiftCardCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
    let code = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export function createGiftCard(data: {
    amountCents: number;
    purchaserEmail: string;
    purchaserName?: string;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    expiresAt?: Date;
}): GiftCard {
    const code = generateGiftCardCode();

    const result = db.prepare(`
        INSERT INTO gift_cards (code, original_amount, remaining_amount, purchaser_email, purchaser_name, recipient_email, recipient_name, message, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        code,
        data.amountCents,
        data.amountCents,
        data.purchaserEmail,
        data.purchaserName || null,
        data.recipientEmail || null,
        data.recipientName || null,
        data.message || null,
        data.expiresAt?.toISOString() || null
    );

    // Log the initial transaction
    db.prepare(`
        INSERT INTO gift_card_transactions (gift_card_id, amount, description)
        VALUES (?, ?, ?)
    `).run(result.lastInsertRowid, data.amountCents, 'Gift card purchased');

    return getGiftCardById(result.lastInsertRowid as number)!;
}

export function getGiftCardById(id: number): GiftCard | undefined {
    return db.prepare('SELECT * FROM gift_cards WHERE id = ?').get(id) as GiftCard | undefined;
}

export function getGiftCardByCode(code: string): GiftCard | undefined {
    return db.prepare('SELECT * FROM gift_cards WHERE code = ?').get(code.toUpperCase().replace(/[^A-Z0-9]/g, '')) as GiftCard | undefined;
}

export function getGiftCardsByEmail(email: string): GiftCard[] {
    return db.prepare(`
        SELECT * FROM gift_cards 
        WHERE purchaser_email = ? OR recipient_email = ?
        ORDER BY created_at DESC
    `).all(email, email) as GiftCard[];
}

export function getAllGiftCards(): GiftCard[] {
    return db.prepare('SELECT * FROM gift_cards ORDER BY created_at DESC').all() as GiftCard[];
}

export function redeemGiftCard(code: string, amountCents: number, description: string): { success: boolean; error?: string; remainingBalance?: number } {
    const card = getGiftCardByCode(code);

    if (!card) {
        return { success: false, error: 'Gift card not found' };
    }

    if (card.status !== 'active') {
        return { success: false, error: `Gift card is ${card.status}` };
    }

    if (card.expires_at && new Date(card.expires_at) < new Date()) {
        db.prepare("UPDATE gift_cards SET status = 'expired' WHERE id = ?").run(card.id);
        return { success: false, error: 'Gift card has expired' };
    }

    if (amountCents > card.remaining_amount) {
        return { success: false, error: 'Insufficient balance', remainingBalance: card.remaining_amount };
    }

    const newBalance = card.remaining_amount - amountCents;
    const newStatus = newBalance === 0 ? 'redeemed' : 'active';

    db.prepare(`
        UPDATE gift_cards SET remaining_amount = ?, status = ? WHERE id = ?
    `).run(newBalance, newStatus, card.id);

    db.prepare(`
        INSERT INTO gift_card_transactions (gift_card_id, amount, description)
        VALUES (?, ?, ?)
    `).run(card.id, -amountCents, description);

    return { success: true, remainingBalance: newBalance };
}

export function updateGiftCardStatus(id: number, status: 'active' | 'redeemed' | 'expired' | 'cancelled'): void {
    db.prepare('UPDATE gift_cards SET status = ? WHERE id = ?').run(status, id);
}

export function getGiftCardTransactions(giftCardId: number): GiftCardTransaction[] {
    return db.prepare('SELECT * FROM gift_card_transactions WHERE gift_card_id = ? ORDER BY created_at DESC').all(giftCardId) as GiftCardTransaction[];
}

export function getGiftCardStats(): { total: number; active: number; redeemed: number; totalValue: number; redeemedValue: number } {
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) as redeemed,
            SUM(original_amount) as totalValue,
            SUM(original_amount - remaining_amount) as redeemedValue
        FROM gift_cards
    `).get() as { total: number; active: number; redeemed: number; totalValue: number; redeemedValue: number };

    return stats;
}

// Course purchase operations
export interface CoursePurchase {
    id: number;
    user_id: number;
    course_slug: string;
    amount_paid: number;
    gift_card_code: string | null;
    status: 'active' | 'refunded' | 'expired';
    purchased_at: string;
    expires_at: string | null;
}

export function purchaseCourse(data: {
    userId: number;
    courseSlug: string;
    amountPaid: number;
    giftCardCode?: string;
    expiresAt?: Date;
}): CoursePurchase {
    const result = db.prepare(`
        INSERT INTO course_purchases (user_id, course_slug, amount_paid, gift_card_code, expires_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        data.userId,
        data.courseSlug,
        data.amountPaid,
        data.giftCardCode || null,
        data.expiresAt?.toISOString() || null
    );

    return getCoursePurchaseById(result.lastInsertRowid as number)!;
}

export function getCoursePurchaseById(id: number): CoursePurchase | undefined {
    return db.prepare('SELECT * FROM course_purchases WHERE id = ?').get(id) as CoursePurchase | undefined;
}

export function getUserCourses(userId: number): CoursePurchase[] {
    return db.prepare(`
        SELECT * FROM course_purchases 
        WHERE user_id = ? AND status = 'active'
        ORDER BY purchased_at DESC
    `).all(userId) as CoursePurchase[];
}

export function hasUserPurchasedCourse(userId: number, courseSlug: string): boolean {
    const purchase = db.prepare(`
        SELECT id FROM course_purchases 
        WHERE user_id = ? AND course_slug = ? AND status = 'active'
    `).get(userId, courseSlug);
    return !!purchase;
}

export function getCoursePurchase(userId: number, courseSlug: string): CoursePurchase | undefined {
    return db.prepare(`
        SELECT * FROM course_purchases 
        WHERE user_id = ? AND course_slug = ?
    `).get(userId, courseSlug) as CoursePurchase | undefined;
}

export function getAllCoursePurchases(): CoursePurchase[] {
    return db.prepare('SELECT * FROM course_purchases ORDER BY purchased_at DESC').all() as CoursePurchase[];
}

export function getCoursePurchaseStats(): { totalPurchases: number; totalRevenue: number; uniqueCourses: number } {
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as totalPurchases,
            SUM(amount_paid) as totalRevenue,
            COUNT(DISTINCT course_slug) as uniqueCourses
        FROM course_purchases
        WHERE status = 'active'
    `).get() as { totalPurchases: number; totalRevenue: number; uniqueCourses: number };

    return stats;
}


