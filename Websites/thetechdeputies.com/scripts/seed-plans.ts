#!/usr/bin/env tsx
/**
 * @file seed-plans.ts
 * @description Seeds the database with subscription plans
 */

import { db } from '../src/lib/db';
import { DEFAULT_PLANS } from '../src/lib/plans';
import { logger } from '../src/lib/logger';

async function main() {
  logger.info('Starting plan seeding...');

  for (const plan of DEFAULT_PLANS) {
    const existing = await db.plan.findUnique({
      where: { name: plan.name },
    });

    if (existing) {
      logger.info(`Plan ${plan.name} already exists, updating...`);
      await db.plan.update({
        where: { id: existing.id },
        data: {
          displayName: plan.displayName,
          description: plan.description,
          priceInCents: plan.priceInCents,
          tier: plan.tier,
          sessionLimit: plan.sessionLimit,
          courseInclusion: plan.courseInclusion,
          familySize: plan.familySize,
          supportTier: plan.supportTier,
          features: plan.features,
        },
      });
    } else {
      logger.info(`Creating plan ${plan.name}...`);
      await db.plan.create({
        data: {
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          priceInCents: plan.priceInCents,
          tier: plan.tier,
          sessionLimit: plan.sessionLimit,
          courseInclusion: plan.courseInclusion,
          familySize: plan.familySize,
          supportTier: plan.supportTier,
          features: plan.features,
        },
      });
    }
  }

  logger.info('Plan seeding completed successfully!');
  
  // Display created plans
  const allPlans = await db.plan.findMany({
    orderBy: { priceInCents: 'asc' },
  });
  
  console.log('\nCreated Plans:');
  allPlans.forEach((plan) => {
    console.log(`- ${plan.displayName}: $${(plan.priceInCents / 100).toFixed(2)}/month (${plan.sessionLimit} sessions)`);
  });
}

main()
  .catch((error) => {
    logger.error('Error seeding plans:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
