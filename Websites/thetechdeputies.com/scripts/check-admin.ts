import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL_REMOTE;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'test@sn0n.com';
  const newPassword = 'password';
  
  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  // Update the user
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });
  
  console.log(`✓ Password updated for ${email}`);
  console.log(`  New password: ${newPassword}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
