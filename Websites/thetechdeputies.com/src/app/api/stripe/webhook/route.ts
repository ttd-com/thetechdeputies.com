import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { sendSubscriptionConfirmationEmail, sendSubscriptionCancelledEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events for subscription lifecycle
 */
export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const body = await req.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logger.info(`Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as any);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const userId = parseInt(subscription.metadata?.userId);
    const planId = parseInt(subscription.metadata?.planId);

    if (!userId || !planId) {
      logger.warn('Subscription created without userId or planId metadata');
      return;
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.warn(`User ${userId} not found for subscription`);
      return;
    }

    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      logger.warn(`Plan ${planId} not found for subscription`);
      return;
    }

    // Create subscription record
    await db.userSubscription.create({
      data: {
        userId,
        planId,
        stripeSubscriptionId: subscription.id,
        status: 'active',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Send confirmation email
    await sendSubscriptionConfirmationEmail(user.email, plan.displayName);
    logger.info(`Subscription created for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const existingSubscription = await db.userSubscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      logger.warn(`No subscription found for Stripe ID ${subscription.id}`);
      return;
    }

    let status: 'active' | 'cancelled' | 'past_due' | 'expired' = 'active';
    if (subscription.status === 'cancelled') {
      status = 'cancelled';
    } else if (subscription.status === 'past_due') {
      status = 'past_due';
    }

    await db.userSubscription.update({
      where: { id: existingSubscription.id },
      data: {
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    logger.info(`Subscription updated: ${subscription.id}, status: ${status}`);
  } catch (error) {
    logger.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const existingSubscription = await db.userSubscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      logger.warn(`No subscription found for Stripe ID ${subscription.id}`);
      return;
    }

    await db.userSubscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    const user = await db.user.findUnique({
      where: { id: existingSubscription.userId },
    });

    if (user) {
      await sendSubscriptionCancelledEmail(user.email);
    }

    logger.info(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    logger.info(`Payment succeeded for invoice ${invoice.id}`);
    // Could increment session count for the month here if needed
  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    logger.warn(`Payment failed for invoice ${invoice.id}`);
  } catch (error) {
    logger.error('Error handling payment failed:', error);
  }
}
