import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSubscriptionDetails } from '@/lib/stripe';

export async function GET() {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const subscriptions = await getSubscriptionDetails();

        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error('Failed to get subscriptions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
