import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/subscriptions
 * Admin endpoint to create/assign subscriptions for users
 * Requires admin role
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, planId } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and Plan ID are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get plan
    const plan = await db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription
    const existingActive = await db.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      // Cancel existing subscription first
      await db.userSubscription.update({
        where: { id: existingActive.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    }

    // Create new subscription (admin-created, no Stripe connection)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const subscription = await db.userSubscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        sessionBookedThisMonth: 0,
      },
    });

    logger.info(`Admin created subscription for user ${userId}, plan ${planId}`);

    return NextResponse.json(
      { success: true, subscription },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Admin create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await db.userSubscription.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { subscriptions },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
