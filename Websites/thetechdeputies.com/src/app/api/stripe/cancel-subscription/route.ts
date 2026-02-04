import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';

/**
 * POST /api/stripe/cancel-subscription
 * Cancel user's active subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const stripe = getStripe();

    // Get active subscription
    const subscription = await db.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel Stripe subscription
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    // Update database
    await db.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    logger.info(`Subscription cancelled for user ${userId}`);

    return NextResponse.json(
      { success: true, message: 'Subscription cancelled' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
