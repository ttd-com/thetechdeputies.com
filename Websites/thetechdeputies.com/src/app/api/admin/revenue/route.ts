import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMonthlyRevenue, getCurrentMonthRevenue, getActiveSubscriptions } from '@/lib/stripe';

export async function GET() {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const [mrr, currentRevenue, subscriptions] = await Promise.all([
            getMonthlyRevenue(),
            getCurrentMonthRevenue(),
            getActiveSubscriptions(),
        ]);

        return NextResponse.json({
            monthlyRecurringRevenue: mrr,
            currentMonthRevenue: currentRevenue,
            activeSubscriptions: subscriptions.length,
        });
    } catch (error) {
        console.error('Failed to get revenue:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
