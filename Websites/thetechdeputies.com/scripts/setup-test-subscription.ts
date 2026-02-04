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

import { PrismaClient, SubscriptionStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL_REMOTE;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Find or get the first plan
    const plan = await prisma.plan.findFirst();
    if (!plan) {
      console.error('No plans found in database. Run seed-plans.ts first.');
      process.exit(1);
    }

    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@sn0n.com' },
    });

    if (!user) {
      console.error('User test@sn0n.com not found');
      process.exit(1);
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId_status: {
          userId: user.id,
          status: 'ACTIVE',
        },
      },
    });

    if (existingSubscription) {
      console.log('✓ User already has an active subscription');
      console.log(`  Plan: ${plan.displayName}`);
      console.log(`  Status: ${existingSubscription.status}`);
      console.log(`  Sessions booked this month: ${existingSubscription.sessionBookedThisMonth}`);
    } else {
      // Create new subscription
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const subscription = await prisma.userSubscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'ACTIVE' as any,
          currentPeriodStart: now,
          currentPeriodEnd: endOfMonth,
          sessionBookedThisMonth: 0,
        },
        include: {
          plan: true,
          user: true,
        },
      });

      console.log('✓ Subscription created successfully');
      console.log(`  User: ${subscription.user.email}`);
      console.log(`  Plan: ${subscription.plan.displayName}`);
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Session Limit: ${subscription.plan.sessionLimit}`);
      console.log(`  Period: ${subscription.currentPeriodStart.toLocaleDateString()} - ${subscription.currentPeriodEnd.toLocaleDateString()}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
