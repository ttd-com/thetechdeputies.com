#!/usr/bin/env ts-node
/**
 * Script: Update subscription plan pricing in database
 * 
 * This script updates the plan prices in the database to match
 * the intended pricing model:
 * - Basic: $49/month (4900 cents) - UNCHANGED
 * - Standard: $89/month (8900 cents) - was $99
 * - Premium: $149/month (14900 cents) - was $199
 * 
 * Run this ONCE after deploying code changes to production
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function updatePricing() {
  console.log('Starting plan pricing update...\n');

  const updates = [
    {
      name: 'basic',
      newPrice: 4900,
      description: 'Basic ($49/month)',
    },
    {
      name: 'standard',
      newPrice: 8900,
      description: 'Standard ($89/month)',
    },
    {
      name: 'premium',
      newPrice: 14900,
      description: 'Premium ($149/month)',
    },
  ];

  for (const update of updates) {
    try {
      const plan = await db.plan.findUnique({
        where: { name: update.name },
      });

      if (!plan) {
        console.log(`❌ Plan "${update.name}" not found`);
        continue;
      }

      const oldPrice = plan.priceInCents;
      
      const updated = await db.plan.update({
        where: { name: update.name },
        data: { priceInCents: update.newPrice },
      });

      const oldPriceFormatted = (oldPrice / 100).toFixed(2);
      const newPriceFormatted = (update.newPrice / 100).toFixed(2);

      console.log(`✅ ${update.description}`);
      console.log(`   Old: $${oldPriceFormatted} (${oldPrice}¢)`);
      console.log(`   New: $${newPriceFormatted} (${update.newPrice}¢)\n`);
    } catch (error) {
      console.error(`❌ Error updating ${update.name}:`, error);
    }
  }

  console.log('Pricing update complete!');
  console.log('\nVerifying all plans...');

  const allPlans = await db.plan.findMany({
    orderBy: { priceInCents: 'asc' },
  });

  console.log('\nCurrent Plan Pricing:');
  for (const plan of allPlans) {
    const price = (plan.priceInCents / 100).toFixed(2);
    console.log(`- ${plan.displayName}: $${price}/month`);
  }

  await db.$disconnect();
}

updatePricing().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
