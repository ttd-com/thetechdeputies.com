import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/update-plan-pricing
 * Update subscription plan pricing (admin only)
 * 
 * This endpoint fixes pricing in the database to match the intended model:
 * - Basic: $49/month (4900 cents)
 * - Standard: $89/month (8900 cents)
 * - Premium: $149/month (14900 cents)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Verify admin access
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if ((user?.role as any) !== 'admin') {
      logger.warn(`Non-admin user ${user?.id} attempted pricing update`, { userId: user?.id });
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const updates = [
      { name: 'basic', newPrice: 4900, description: 'Basic ($49/month)' },
      { name: 'standard', newPrice: 8900, description: 'Standard ($89/month)' },
      { name: 'premium', newPrice: 14900, description: 'Premium ($149/month)' },
    ];

    const results = [];

    for (const update of updates) {
      const plan = await db.plan.findUnique({
        where: { name: update.name },
      });

      if (!plan) {
        results.push({
          plan: update.name,
          status: 'error',
          message: 'Plan not found',
        });
        continue;
      }

      const oldPrice = plan.priceInCents;
      
      const updated = await db.plan.update({
        where: { name: update.name },
        data: { priceInCents: update.newPrice },
      });

      const oldPriceFormatted = (oldPrice / 100).toFixed(2);
      const newPriceFormatted = (update.newPrice / 100).toFixed(2);

      logger.info(`Updated plan pricing: ${update.name}`, {
        oldPrice: oldPrice,
        newPrice: update.newPrice,
        adminId: user?.id,
      });

      results.push({
        plan: update.name,
        status: 'success',
        oldPrice: `$${oldPriceFormatted}`,
        newPrice: `$${newPriceFormatted}`,
      });
    }

    // Verify all plans
    const allPlans = await db.plan.findMany({
      select: { name: true, displayName: true, priceInCents: true },
      orderBy: { priceInCents: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Plan pricing updated successfully',
        updates: results,
        allPlans: allPlans.map((p) => ({
          name: p.name,
          displayName: p.displayName,
          price: `$${(p.priceInCents / 100).toFixed(2)}`,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error updating plan pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to update plan pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
