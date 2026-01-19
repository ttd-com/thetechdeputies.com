import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasUserPurchasedCourse, getUserByEmail } from '@/lib/db';

// POST - Check if user has access to a course
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({
                hasAccess: false,
                reason: 'not_authenticated',
            });
        }

        const user = getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({
                hasAccess: false,
                reason: 'user_not_found',
            });
        }

        const body = await request.json();
        const { courseSlug } = body;

        if (!courseSlug) {
            return NextResponse.json(
                { error: 'Course slug is required' },
                { status: 400 }
            );
        }

        const hasAccess = hasUserPurchasedCourse(user.id, courseSlug);

        return NextResponse.json({
            hasAccess,
            courseSlug,
        });
    } catch (error) {
        console.error('Error checking course access:', error);
        return NextResponse.json(
            { error: 'Failed to check access' },
            { status: 500 }
        );
    }
}
