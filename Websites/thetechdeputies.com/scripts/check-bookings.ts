import * as fs from 'fs';
import * as path from 'path';

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

const connectionString = process.env.DATABASE_URL_REMOTE;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: 'test@sn0n.com' }
    });

    console.log('User found:', user?.email, '(ID:', user?.id, ')');

    if (user) {
      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: { event: true }
      });

      console.log('User bookings:', bookings.length);
      bookings.forEach(b => {
        console.log(`  - ${b.id}: ${b.event.title} - Status: ${b.status}`);
      });

      // Get all bookings
      const allBookings = await prisma.booking.findMany({
        include: { event: true, user: true }
      });
      console.log('\nTotal bookings in DB:', allBookings.length);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
