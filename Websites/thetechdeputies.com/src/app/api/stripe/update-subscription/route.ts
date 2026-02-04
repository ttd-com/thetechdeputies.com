import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';

/**
 * POST /api/stripe/update-subscription
 * Update user's subscription to a different plan
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPlanId } = await req.json();

    if (!newPlanId) {
      return NextResponse.json(
        { error: 'New plan ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const stripe = getStripe();

    // Get current subscription
    const currentSubscription = await db.userSubscription.findUnique({
      where: {
        userId_status: {
          userId,
          status: 'ACTIVE',
        },
      },
      include: { plan: true },
    });

    if (!currentSubscription || !currentSubscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get new plan
    const newPlan = await db.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Update Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripeSubscriptionId
    );

    if (!stripeSubscription || stripeSubscription.items.data.length === 0) {
      return NextResponse.json(
        { error: 'Stripe subscription not found' },
        { status: 404 }
      );
    }

    const itemId = stripeSubscription.items.data[0].id;

    // Create or retrieve Stripe price for the new plan
    // In production, you'd store price IDs in the database or use Stripe's product catalog
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: newPlan.priceInCents,
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: newPlan.displayName,
      },
    });

    await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
      items: [
        {
          id: itemId,
          price: price.id,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    // Update database subscription
    await db.userSubscription.update({
      where: { id: currentSubscription.id },
      data: { planId: newPlanId },
    });

    logger.info(`User ${userId} upgraded from plan ${currentSubscription.planId} to ${newPlanId}`);

    return NextResponse.json(
      { success: true, message: 'Subscription updated' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Update subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
