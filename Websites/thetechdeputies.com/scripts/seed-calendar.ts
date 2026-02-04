/**
 * Seed calendar events for testing
 * Run with: npx tsx scripts/seed-calendar.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

// Use the getDatabaseUrl logic from the app
const connectionString = process.env.DATABASE_URL_REMOTE || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.error('❌ No database connection string found');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('🔍 Checking for admin user...');
    
    // Find or create admin
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' as any },
    });

    if (!admin) {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        admin = await prisma.user.update({
          where: { id: firstUser.id },
          data: { role: 'ADMIN' as any },
        });
        console.log(`✅ Promoted ${firstUser.email} to admin`);
      } else {
        console.error('❌ No users found in database');
        process.exit(1);
      }
    } else {
      console.log(`✅ Found admin: ${admin.email}`);
    }

    // Check existing events
    const existingEvents = await prisma.calendarEvent.findMany();
    console.log(`📅 Found ${existingEvents.length} existing calendar events`);

    if (existingEvents.length > 0) {
      console.log('ℹ️  Calendar already has events. Delete them first if you want to reseed.');
      
      // Show first few events
      console.log('\nExisting events:');
      existingEvents.slice(0, 5).forEach(e => {
        console.log(`  - ${e.title} (${e.startTime.toISOString()})`);
      });
      
      process.exit(0);
    }

    console.log('\n🌱 Creating calendar slots...');
    
    const now = new Date();
    const slots = [];

    // Create slots for next 7 days
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const day = new Date(now);
      day.setDate(day.getDate() + dayOffset);
      
      // Morning slot (10 AM)
      const morningStart = new Date(day);
      morningStart.setHours(10, 0, 0, 0);
      const morningEnd = new Date(morningStart);
      morningEnd.setHours(11, 0, 0, 0);
      
      slots.push({
        title: `Morning Tech Support - ${day.toLocaleDateString()}`,
        description: '1-hour tech support session with patient, jargon-free guidance.',
        startTime: morningStart,
        endTime: morningEnd,
        capacity: 2,
        bookedCount: 0,
        adminId: admin.id,
      });
      
      // Afternoon slot (2 PM)
      const afternoonStart = new Date(day);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(afternoonStart);
      afternoonEnd.setHours(15, 0, 0, 0);
      
      slots.push({
        title: `Afternoon Tech Support - ${day.toLocaleDateString()}`,
        description: '1-hour tech support session with patient, jargon-free guidance.',
        startTime: afternoonStart,
        endTime: afternoonEnd,
        capacity: 2,
        bookedCount: 0,
        adminId: admin.id,
      });
      
      // Evening slot (6 PM)
      const eveningStart = new Date(day);
      eveningStart.setHours(18, 0, 0, 0);
      const eveningEnd = new Date(eveningStart);
      eveningEnd.setHours(19, 0, 0, 0);
      
      slots.push({
        title: `Evening Tech Support - ${day.toLocaleDateString()}`,
        description: '1-hour tech support session with patient, jargon-free guidance.',
        startTime: eveningStart,
        endTime: eveningEnd,
        capacity: 2,
        bookedCount: 0,
        adminId: admin.id,
      });
    }

    console.log(`Creating ${slots.length} calendar slots...`);
    
    // Create all slots
    let successCount = 0;
    for (const slot of slots) {
      try {
        const event = await prisma.calendarEvent.create({ data: slot });
        successCount++;
        console.log(`  ✓ Created: ${event.title}`);
      } catch (error) {
        console.error(`  ✗ Failed: ${slot.title}`, error instanceof Error ? error.message : error);
      }
    }

    console.log(`\n✅ Successfully created ${successCount}/${slots.length} calendar slots`);
    
    // Verify
    const allEvents = await prisma.calendarEvent.findMany({
      orderBy: { startTime: 'asc' },
    });
    console.log(`\n📊 Total calendar events in database: ${allEvents.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
