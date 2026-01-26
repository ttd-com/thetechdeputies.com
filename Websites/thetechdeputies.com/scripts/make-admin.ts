// Quick script to make @thetechdeputies.com users admins
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const db = new Database(dbPath);

// Update all @thetechdeputies.com emails to admin
const result = db.prepare("UPDATE users SET role = 'admin' WHERE email LIKE '%@thetechdeputies.com'").run();
console.log(`Updated ${result.changes} users to admin role`);

// Show all users
const users = db.prepare('SELECT id, email, name, role FROM users').all();
console.log('\nAll users:');
console.table(users);

db.close();
