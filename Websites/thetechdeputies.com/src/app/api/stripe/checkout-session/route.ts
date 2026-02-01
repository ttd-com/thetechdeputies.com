import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { headers } from 'next/headers';

/**
 * POST /api/stripe/checkout-session
 * Create a Stripe checkout session for subscription purchase
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, successUrl, cancelUrl } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: user.id.toString(),
        },
      });

      user = await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId || undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.displayName,
              description: plan.description || undefined,
            },
            unit_amount: plan.priceInCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url:
        successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thetechdeputies.com'}/dashboard/subscriptions?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thetechdeputies.com'}/subscriptions`,
      metadata: {
        userId: user.id.toString(),
        planId: planId.toString(),
      },
    });

    return NextResponse.json(
      { sessionId: checkoutSession.id, url: checkoutSession.url },
      { status: 200 }
    );
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
