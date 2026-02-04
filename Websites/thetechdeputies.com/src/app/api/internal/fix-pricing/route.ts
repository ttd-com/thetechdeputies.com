import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Internal-only endpoint to fix database pricing
 * Checks for internal secret header
 * 
 * Usage:
 * curl -X POST http://localhost:3000/api/internal/fix-pricing \
 *   -H "Content-Type: application/json" \
 *   -H "X-Internal-Secret: dev-secret" \
 *   -d '{}'
 */
export async function POST(req: NextRequest) {
  try {
    // Check for internal secret (for development/emergency fixes only)
    const secret = req.headers.get('X-Internal-Secret');
    const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
    
    if (!isLocalhost || secret !== 'dev-secret') {
      logger.warn('Unauthorized access attempt to /api/internal/fix-pricing');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];

    // Fix test user to be admin
    const testUser = await db.user.updateMany({
      where: { email: 'test@sn0n.com' },
      data: { role: 'admin' as any },
    });

    if (testUser.count > 0) {
      logger.info('Updated test user to admin');
      results.push({ action: 'Made test@sn0n.com an admin', success: true });
    }

    // Fix pricing
    const updates = [
      { name: 'basic', newPrice: 4900, label: 'Basic ($49/month)' },
      { name: 'standard', newPrice: 8900, label: 'Standard ($89/month)' },
      { name: 'premium', newPrice: 14900, label: 'Premium ($149/month)' },
    ];

    for (const update of updates) {
      const plan = await db.plan.updateMany({
        where: { name: update.name },
        data: { priceInCents: update.newPrice },
      });

      if (plan.count > 0) {
        logger.info(`Updated pricing for ${update.name}`);
        results.push({
          plan: update.label,
          success: true,
          price: `$${(update.newPrice / 100).toFixed(2)}/month`,
        });
      }
    }

    // Verify
    const allPlans = await db.plan.findMany({
      select: { name: true, displayName: true, priceInCents: true },
      orderBy: { priceInCents: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Database fixes applied',
        updates: results,
        verification: allPlans.map((p) => ({
          name: p.displayName,
          price: `$${(p.priceInCents / 100).toFixed(2)}/month`,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in fix-pricing:', error);
    return NextResponse.json(
      { error: 'Failed to apply fixes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
