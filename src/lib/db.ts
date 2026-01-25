/**
 * @file db.ts
 * @description Database operations using Prisma ORM with PostgreSQL.
 * Replaces better-sqlite3 for serverless compatibility (Vercel, etc).
 */

import { PrismaClient, Role, GiftCardStatus, CoursePurchaseStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from './logger';

// Singleton pattern for Prisma Client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} else {
    // Prevent multiple instances in development
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
    if (!globalForPrisma.prisma) {
        const connectionString = process.env.DATABASE_URL;
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        globalForPrisma.prisma = new PrismaClient({
            adapter,
            log: ['error', 'warn'],
        });
    }
    prisma = globalForPrisma.prisma;
}

export const db = prisma;

// Re-export Prisma types
export type { User, GiftCard, GiftCardTransaction, CoursePurchase, Role } from '@prisma/client';

// Note: Tables are defined in prisma/schema.prisma
// Run 'npx prisma migrate deploy' in production or 'npx prisma migrate dev' in development
// to apply schema changes to the database.

// ============================================================================
// User Operations
// ============================================================================

export async function getUserByEmail(email: string) {
    try {
        return await prisma.user.findUnique({
            where: { email },
        });
    } catch (error) {
        logger.error('Error fetching user by email', error, { email });
        return null;
    }
}

export async function getUserById(id: number) {
    try {
        return await prisma.user.findUnique({
            where: { id },
        });
    } catch (error) {
        logger.error('Error fetching user by id', error, { userId: id });
        return null;
    }
}

export async function createUser(email: string, passwordHash: string, name?: string) {
    try {
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? Role.ADMIN : Role.USER;

        // Prisma client expects the enum value as the client enum name
        // (e.g. 'ADMIN' / 'USER'). Ensure we pass the correct string.
        const roleValue = role === Role.ADMIN ? 'ADMIN' : 'USER';

        return await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || null,
                role: roleValue as any,
            },
        });
    } catch (error) {
        logger.error('Error creating user', error, { email });
        throw error;
    }
}

export async function updateUserPassword(userId: number, passwordHash: string) {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    } catch (error) {
        logger.error('Error updating user password', error, { userId });
        throw error;
    }
}

export async function getAllUsers() {
    try {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        logger.error('Error fetching all users', error);
        return [];
    }
}

// ============================================================================
// Password Reset Token Operations
// ============================================================================

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date) {
    try {
        // Delete existing tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId },
        });

        return await prisma.passwordResetToken.create({
            data: {
                userId,
                token,
                expiresAt,
                used: false,
            },
        });
    } catch (error) {
        logger.error('Error creating password reset token', error, { userId });
        throw error;
    }
}

export async function getPasswordResetToken(token: string) {
    try {
        return await prisma.passwordResetToken.findUnique({
            where: { token },
        });
    } catch (error) {
        logger.error('Error fetching password reset token', error);
        return null;
    }
}

export async function markTokenAsUsed(token: string) {
    try {
        return await prisma.passwordResetToken.update({
            where: { token },
            data: { used: true },
        });
    } catch (error) {
        logger.error('Error marking token as used', error, { token });
        throw error;
    }
}


// ============================================================================
// Rate Limiting Operations
// ============================================================================

export async function checkRateLimit(
    ipAddress: string,
    endpoint: string,
    maxAttempts: number,
    windowMinutes: number
): Promise<boolean> {
    try {
        const now = new Date();
        const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

        const existing = await prisma.rateLimit.findUnique({
            where: {
                ipAddress_endpoint: { ipAddress, endpoint },
            },
        });

        if (!existing) {
            await prisma.rateLimit.create({
                data: {
                    ipAddress,
                    endpoint,
                    attempts: 1,
                    windowStart: now,
                },
            });
            return true;
        }

        if (existing.windowStart < windowStart) {
            // Reset the window
            await prisma.rateLimit.update({
                where: {
                    ipAddress_endpoint: { ipAddress, endpoint },
                },
                data: {
                    attempts: 1,
                    windowStart: now,
                },
            });
            return true;
        }

        if (existing.attempts >= maxAttempts) {
            return false;
        }

        await prisma.rateLimit.update({
            where: {
                ipAddress_endpoint: { ipAddress, endpoint },
            },
            data: {
                attempts: existing.attempts + 1,
            },
        });

        return true;
    } catch (error) {
        logger.error('Error checking rate limit', error, { ipAddress, endpoint });
        return false;
    }
}

// ============================================================================
// Settings Operations
// ============================================================================

export async function getSetting(key: string) {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
        });
        return setting?.value || null;
    } catch (error) {
        logger.error('Error fetching setting', error, { key });
        return null;
    }
}

export async function setSetting(key: string, value: string, encrypted = false) {
    try {
        return await prisma.setting.upsert({
            where: { key },
            update: { value, encrypted },
            create: { key, value, encrypted },
        });
    } catch (error) {
        logger.error('Error setting value', error, { key });
        throw error;
    }
}

export async function getAllSettings() {
    try {
        return await prisma.setting.findMany();
    } catch (error) {
        logger.error('Error fetching all settings', error);
        return [];
    }
}


// ============================================================================
// Email Verification Token Operations
// ============================================================================

export async function createEmailVerificationToken(userId: number, token: string, expiresAt: Date) {
    try {
        // Delete existing tokens for this user
        await prisma.emailVerificationToken.deleteMany({
            where: { userId },
        });

        return await prisma.emailVerificationToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    } catch (error) {
        logger.error('Error creating email verification token', error, { userId });
        throw error;
    }
}

export async function getEmailVerificationToken(token: string) {
    try {
        return await prisma.emailVerificationToken.findUnique({
            where: { token },
        });
    } catch (error) {
        logger.error('Error fetching email verification token', error);
        return null;
    }
}

export async function verifyUserEmail(userId: number) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        });

        await prisma.emailVerificationToken.deleteMany({
            where: { userId },
        });
    } catch (error) {
        logger.error('Error verifying user email', error, { userId });
        throw error;
    }
}

// ============================================================================
// Gift Card Operations
// ============================================================================

export function generateGiftCardCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function createGiftCard(data: {
    amountCents: number;
    purchaserEmail: string;
    purchaserName?: string;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    expiresAt?: Date;
}) {
    try {
        const code = generateGiftCardCode();

        const giftCard = await prisma.giftCard.create({
            data: {
                code,
                originalAmount: data.amountCents,
                remainingAmount: data.amountCents,
                purchaserEmail: data.purchaserEmail,
                purchaserName: data.purchaserName || null,
                recipientEmail: data.recipientEmail || null,
                recipientName: data.recipientName || null,
                message: data.message || null,
                expiresAt: data.expiresAt || null,
            },
        });

        // Log initial transaction
        await prisma.giftCardTransaction.create({
            data: {
                giftCardId: giftCard.id,
                amount: data.amountCents,
                description: 'Gift card purchased',
            },
        });

        return giftCard;
    } catch (error) {
        logger.error('Error creating gift card', error);
        throw error;
    }
}

export async function getGiftCardById(id: number) {
    try {
        return await prisma.giftCard.findUnique({
            where: { id },
        });
    } catch (error) {
        logger.error('Error fetching gift card by id', error, { giftCardId: id });
        return null;
    }
}

export async function getGiftCardByCode(code: string) {
    try {
        const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
        return await prisma.giftCard.findUnique({
            where: { code: cleanCode },
        });
    } catch (error) {
        logger.error('Error fetching gift card by code', error);
        return null;
    }
}

export async function getGiftCardsByEmail(email: string) {
    try {
        return await prisma.giftCard.findMany({
            where: {
                OR: [
                    { purchaserEmail: email },
                    { recipientEmail: email },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        logger.error('Error fetching gift cards by email', error, { email });
        return [];
    }
}

export async function getAllGiftCards() {
    try {
        return await prisma.giftCard.findMany({
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        logger.error('Error fetching all gift cards', error);
        return [];
    }
}

export async function redeemGiftCard(code: string, amountCents: number, description: string) {
    try {
        const card = await getGiftCardByCode(code);

        if (!card) {
            return { success: false, error: 'Gift card not found' };
        }

        if (card.status !== GiftCardStatus.ACTIVE) {
            return { success: false, error: `Gift card is ${card.status}` };
        }

        if (card.expiresAt && card.expiresAt < new Date()) {
            await prisma.giftCard.update({
                where: { id: card.id },
                data: { status: GiftCardStatus.EXPIRED },
            });
            return { success: false, error: 'Gift card has expired' };
        }

        if (amountCents > card.remainingAmount) {
            return { success: false, error: 'Insufficient balance', remainingBalance: card.remainingAmount };
        }

        const newBalance = card.remainingAmount - amountCents;
        const newStatus = newBalance === 0 ? GiftCardStatus.REDEEMED : GiftCardStatus.ACTIVE;

        await prisma.giftCard.update({
            where: { id: card.id },
            data: {
                remainingAmount: newBalance,
                status: newStatus,
            },
        });

        await prisma.giftCardTransaction.create({
            data: {
                giftCardId: card.id,
                amount: -amountCents,
                description,
            },
        });

        return { success: true, remainingBalance: newBalance };
    } catch (error) {
        logger.error('Error redeeming gift card', error, { code });
        throw error;
    }
}

export async function updateGiftCardStatus(id: number, status: GiftCardStatus) {
    try {
        return await prisma.giftCard.update({
            where: { id },
            data: { status },
        });
    } catch (error) {
        logger.error('Error updating gift card status', error, { giftCardId: id });
        throw error;
    }
}

export async function getGiftCardTransactions(giftCardId: number) {
    try {
        return await prisma.giftCardTransaction.findMany({
            where: { giftCardId },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        logger.error('Error fetching gift card transactions', error, { giftCardId });
        return [];
    }
}

export async function getGiftCardStats() {
    try {
        const giftCards = await prisma.giftCard.findMany();
        const activeCards = giftCards.filter((card) => card.status === GiftCardStatus.ACTIVE).length;
        const redeemedCards = giftCards.filter((card) => card.status === GiftCardStatus.REDEEMED).length;
        const totalValue = giftCards.reduce((sum, card) => sum + card.originalAmount, 0);
        const redeemedValue = giftCards.reduce((sum, card) => sum + (card.originalAmount - card.remainingAmount), 0);

        return {
            total: giftCards.length,
            active: activeCards,
            redeemed: redeemedCards,
            totalValue,
            redeemedValue,
        };
    } catch (error) {
        logger.error('Error fetching gift card stats', error);
        return { total: 0, active: 0, redeemed: 0, totalValue: 0, redeemedValue: 0 };
    }
}

// ============================================================================
// Course Purchase Operations
// ============================================================================

export async function purchaseCourse(data: {
    userId: number;
    courseSlug: string;
    amountPaid: number;
    giftCardCode?: string;
    expiresAt?: Date;
}) {
    try {
        return await prisma.coursePurchase.create({
            data: {
                userId: data.userId,
                courseSlug: data.courseSlug,
                amountPaid: data.amountPaid,
                giftCardCode: data.giftCardCode || null,
                expiresAt: data.expiresAt || null,
            },
        });
    } catch (error) {
        logger.error('Error creating course purchase', error, { userId: data.userId });
        throw error;
    }
}

export async function getCoursePurchaseById(id: number) {
    try {
        return await prisma.coursePurchase.findUnique({
            where: { id },
        });
    } catch (error) {
        logger.error('Error fetching course purchase by id', error, { purchaseId: id });
        return null;
    }
}

export async function getUserCourses(userId: number) {
    try {
        return await prisma.coursePurchase.findMany({
            where: {
                userId,
                status: CoursePurchaseStatus.ACTIVE,
            },
            orderBy: { purchasedAt: 'desc' },
        });
    } catch (error) {
        logger.error('Error fetching user courses', error, { userId });
        return [];
    }
}

export async function hasUserPurchasedCourse(userId: number, courseSlug: string): Promise<boolean> {
    try {
        const purchase = await prisma.coursePurchase.findFirst({
            where: {
                userId,
                courseSlug,
                status: CoursePurchaseStatus.ACTIVE,
            },
        });
        return !!purchase;
    } catch (error) {
        logger.error('Error checking course purchase', error, { userId, courseSlug });
        return false;
    }
}

export async function getCoursePurchase(userId: number, courseSlug: string) {
    try {
        return await prisma.coursePurchase.findFirst({
            where: { userId, courseSlug },
        });
    } catch (error) {
        logger.error('Error fetching course purchase', error, { userId, courseSlug });
        return null;
    }
}

export async function getAllCoursePurchases() {
    try {
        return await prisma.coursePurchase.findMany({
            orderBy: { purchasedAt: 'desc' },
        });
    } catch (error) {
        logger.error('Error fetching all course purchases', error);
        return [];
    }
}

export async function getCoursePurchaseStats() {
    try {
        const purchases = await prisma.coursePurchase.findMany({
            where: { status: CoursePurchaseStatus.ACTIVE },
        });

        const totalPurchases = purchases.length;
        const totalRevenue = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
        const uniqueCourses = new Set(purchases.map((p) => p.courseSlug)).size;

        return {
            totalPurchases,
            totalRevenue,
            uniqueCourses,
        };
    } catch (error) {
        logger.error('Error fetching course purchase stats', error);
        return { totalPurchases: 0, totalRevenue: 0, uniqueCourses: 0 };
    }
}


