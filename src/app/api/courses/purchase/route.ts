import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    purchaseCourse,
    hasUserPurchasedCourse,
    getUserByEmail,
    getGiftCardByCode,
    redeemGiftCard
} from '@/lib/db';
import { getCourseBySlug } from '@/lib/courses';

// POST - Purchase a course
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { courseSlug, giftCardCode } = body;

        // Validate course exists
        const course = getCourseBySlug(courseSlug);
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Check if already purchased
        if (hasUserPurchasedCourse(user.id, courseSlug)) {
            return NextResponse.json(
                { error: 'You already own this course' },
                { status: 400 }
            );
        }

        let amountPaid = course.priceInCents;
        let usedGiftCardCode: string | undefined;

        // If gift card provided, try to redeem it
        if (giftCardCode) {
            const giftCard = getGiftCardByCode(giftCardCode);

            if (!giftCard) {
                return NextResponse.json(
                    { error: 'Gift card not found' },
                    { status: 400 }
                );
            }

            if (giftCard.status !== 'active') {
                return NextResponse.json(
                    { error: `Gift card is ${giftCard.status}` },
                    { status: 400 }
                );
            }

            // Calculate how much to redeem
            const redeemAmount = Math.min(giftCard.remaining_amount, course.priceInCents);

            // Redeem the gift card
            const redeemResult = redeemGiftCard(
                giftCardCode,
                redeemAmount,
                `Course purchase: ${course.title}`
            );

            if (!redeemResult.success) {
                return NextResponse.json(
                    { error: redeemResult.error },
                    { status: 400 }
                );
            }

            amountPaid = course.priceInCents - redeemAmount;
            usedGiftCardCode = giftCardCode;

            // If there's still an amount to pay, in a real app you'd integrate with Stripe here
            // For now, we'll allow $0 purchases (fully covered by gift card) or log the remaining
            if (amountPaid > 0) {
                // In production: Charge remaining amount via Stripe
                console.log(`Remaining amount to charge: $${(amountPaid / 100).toFixed(2)}`);
                // For demo, we'll just proceed (simulating free or gift card purchase)
            }
        }

        // Create the purchase
        const purchase = purchaseCourse({
            userId: user.id,
            courseSlug,
            amountPaid: course.priceInCents, // Store full price for records
            giftCardCode: usedGiftCardCode,
        });

        return NextResponse.json({
            success: true,
            purchase: {
                id: purchase.id,
                courseSlug: purchase.course_slug,
                amountPaid: purchase.amount_paid,
                purchasedAt: purchase.purchased_at,
            },
            message: `Successfully enrolled in ${course.title}!`,
        });
    } catch (error) {
        console.error('Error purchasing course:', error);
        return NextResponse.json(
            { error: 'Failed to purchase course' },
            { status: 500 }
        );
    }
}
