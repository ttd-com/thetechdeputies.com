import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redeemGiftCard } from '@/lib/db';

// POST - Redeem gift card (requires auth)
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { code, amountCents, description } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Gift card code is required' },
                { status: 400 }
            );
        }

        if (!amountCents || amountCents <= 0) {
            return NextResponse.json(
                { error: 'Amount must be greater than 0' },
                { status: 400 }
            );
        }

        const result = redeemGiftCard(
            code,
            amountCents,
            description || `Redeemed by ${session.user.email}`
        );

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error,
                    remainingBalance: result.remainingBalance,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            remainingBalance: result.remainingBalance,
            message: result.remainingBalance === 0
                ? 'Gift card fully redeemed'
                : `$${(amountCents / 100).toFixed(2)} redeemed. Remaining balance: $${(result.remainingBalance! / 100).toFixed(2)}`,
        });
    } catch (error) {
        console.error('Error redeeming gift card:', error);
        return NextResponse.json(
            { error: 'Failed to redeem gift card' },
            { status: 500 }
        );
    }
}
