import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGiftCardsByEmail, createGiftCard, type GiftCard } from '@/lib/db';

// GET - List user's gift cards
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const giftCards = getGiftCardsByEmail(session.user.email);

        // Separate into purchased and received
        const purchased = giftCards.filter(gc => gc.purchaser_email === session.user.email);
        const received = giftCards.filter(gc => gc.recipient_email === session.user.email);

        return NextResponse.json({
            purchased,
            received,
        });
    } catch (error) {
        console.error('Error fetching gift cards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gift cards' },
            { status: 500 }
        );
    }
}

// POST - Create a new gift card (purchase)
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
        const { amountCents, recipientEmail, recipientName, message } = body;

        // Validate amount
        if (!amountCents || amountCents < 2500) { // Minimum $25
            return NextResponse.json(
                { error: 'Minimum gift card amount is $25' },
                { status: 400 }
            );
        }

        if (amountCents > 50000) { // Maximum $500
            return NextResponse.json(
                { error: 'Maximum gift card amount is $500' },
                { status: 400 }
            );
        }

        // Create the gift card
        const giftCard = createGiftCard({
            amountCents,
            purchaserEmail: session.user.email,
            purchaserName: session.user.name || undefined,
            recipientEmail,
            recipientName,
            message,
        });

        // TODO: In production, integrate with payment processor here
        // TODO: Send email to recipient if recipientEmail is provided

        return NextResponse.json({
            success: true,
            giftCard: {
                id: giftCard.id,
                code: giftCard.code,
                amount: giftCard.original_amount,
                recipientEmail: giftCard.recipient_email,
            },
        });
    } catch (error) {
        console.error('Error creating gift card:', error);
        return NextResponse.json(
            { error: 'Failed to create gift card' },
            { status: 500 }
        );
    }
}
