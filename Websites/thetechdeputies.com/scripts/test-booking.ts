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

const connectionString = process.env.DATABASE_URL_REMOTE;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Get the first calendar event
    const event = await prisma.calendarEvent.findFirst({
      orderBy: { startTime: 'asc' }
    });

    if (!event) {
      console.error('No calendar events found');
      process.exit(1);
    }

    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@sn0n.com' }
    });

    if (!user) {
      console.error('User test@sn0n.com not found');
      process.exit(1);
    }

    // Try to create a booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        eventId: event.id,
        status: 'CONFIRMED' as any,
      },
      include: {
        event: true,
        user: true,
      }
    });

    console.log('✓ Booking created successfully');
    console.log(`  Event: ${booking.event.title}`);
    console.log(`  User: ${booking.user.email}`);
    console.log(`  Time: ${booking.event.startTime}`);
    console.log(`  Status: ${booking.status}`);

    // Update the calendar event's booked count
    await prisma.calendarEvent.update({
      where: { id: event.id },
      data: { bookedCount: { increment: 1 } }
    });

    console.log('✓ Calendar event booked count incremented');

    // Update the user subscription's session count
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE' as any,
      }
    });

    if (subscription) {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { sessionBookedThisMonth: { increment: 1 } }
      });
      console.log('✓ User subscription session count updated');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
