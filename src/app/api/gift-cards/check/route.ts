import { NextResponse } from 'next/server';
import { getGiftCardByCode } from '@/lib/db';

// POST - Check gift card balance (public)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Gift card code is required' },
                { status: 400 }
            );
        }

        // Clean up the code (remove dashes, spaces, etc.)
        const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

        const giftCard = getGiftCardByCode(cleanCode);

        if (!giftCard) {
            return NextResponse.json(
                { error: 'Gift card not found' },
                { status: 404 }
            );
        }

        // Check if expired
        if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
            return NextResponse.json({
                found: true,
                status: 'expired',
                message: 'This gift card has expired',
            });
        }

        if (giftCard.status === 'cancelled') {
            return NextResponse.json({
                found: true,
                status: 'cancelled',
                message: 'This gift card has been cancelled',
            });
        }

        if (giftCard.status === 'redeemed') {
            return NextResponse.json({
                found: true,
                status: 'redeemed',
                balance: 0,
                message: 'This gift card has been fully redeemed',
            });
        }

        return NextResponse.json({
            found: true,
            status: giftCard.status,
            balance: giftCard.remaining_amount,
            originalAmount: giftCard.original_amount,
        });
    } catch (error) {
        console.error('Error checking gift card:', error);
        return NextResponse.json(
            { error: 'Failed to check gift card' },
            { status: 500 }
        );
    }
}
