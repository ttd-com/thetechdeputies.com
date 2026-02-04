/**
 * Quick script to update test user to admin and update plan pricing
 * Run with: node scripts/fix-admin-and-pricing.mjs
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Starting database fixes...\n');

  // Make test user admin
  try {
    const user = await db.user.update({
      where: { email: 'test@sn0n.com' },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Made ${user.email} an admin`);
  } catch (error) {
    console.log(`⚠️ Could not update test user:`, error instanceof Error ? error.message : error);
  }

  // Update plan pricing
  console.log('\nUpdating plan pricing...\n');

  const updates = [
    { name: 'basic', newPrice: 4900, description: 'Basic ($49/month)' },
    { name: 'standard', newPrice: 8900, description: 'Standard ($89/month)' },
    { name: 'premium', newPrice: 14900, description: 'Premium ($149/month)' },
  ];

  for (const update of updates) {
    try {
      const plan = await db.plan.findUnique({
        where: { name: update.name },
      });

      if (!plan) {
        console.log(`❌ ${update.description}: Plan not found`);
        continue;
      }

      const oldPrice = plan.priceInCents;
      
      const updated = await db.plan.update({
        where: { name: update.name },
        data: { priceInCents: update.newPrice },
      });

      const oldFormatted = (oldPrice / 100).toFixed(2);
      const newFormatted = (update.newPrice / 100).toFixed(2);

      console.log(`✅ ${update.description}`);
      console.log(`   Old: $${oldFormatted}`);
      console.log(`   New: $${newFormatted}\n`);
    } catch (error) {
      console.error(`❌ Error updating ${update.name}:`, error instanceof Error ? error.message : error);
    }
  }

  // Verify
  console.log('Final pricing:');
  const allPlans = await db.plan.findMany({
    select: { displayName: true, priceInCents: true },
    orderBy: { priceInCents: 'asc' },
  });

  for (const plan of allPlans) {
    console.log(`- ${plan.displayName}: $${(plan.priceInCents / 100).toFixed(2)}/month`);
  }

  await db.$disconnect();
  console.log('\n✅ All fixes complete!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
