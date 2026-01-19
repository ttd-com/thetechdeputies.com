import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllGiftCards, createGiftCard, updateGiftCardStatus, getGiftCardStats, getGiftCardTransactions, type GiftCard } from '@/lib/db';

// GET - List all gift cards (admin only)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const giftCards = getAllGiftCards();
        const stats = getGiftCardStats();

        return NextResponse.json({
            giftCards,
            stats,
        });
    } catch (error) {
        console.error('Error fetching gift cards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gift cards' },
            { status: 500 }
        );
    }
}

// POST - Create a manual gift card (admin only)
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { amountCents, recipientEmail, recipientName, message, purchaserEmail, purchaserName } = body;

        if (!amountCents || amountCents < 100) {
            return NextResponse.json(
                { error: 'Amount must be at least $1' },
                { status: 400 }
            );
        }

        const giftCard = createGiftCard({
            amountCents,
            purchaserEmail: purchaserEmail || session.user.email,
            purchaserName: purchaserName || 'Admin',
            recipientEmail,
            recipientName,
            message,
        });

        return NextResponse.json({
            success: true,
            giftCard,
        });
    } catch (error) {
        console.error('Error creating gift card:', error);
        return NextResponse.json(
            { error: 'Failed to create gift card' },
            { status: 500 }
        );
    }
}

// PATCH - Update gift card status (admin only)
export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: 'ID and status are required' },
                { status: 400 }
            );
        }

        if (!['active', 'redeemed', 'expired', 'cancelled'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        updateGiftCardStatus(id, status);

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Error updating gift card:', error);
        return NextResponse.json(
            { error: 'Failed to update gift card' },
            { status: 500 }
        );
    }
}
