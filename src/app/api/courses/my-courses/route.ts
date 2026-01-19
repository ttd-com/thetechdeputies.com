import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCourses, getUserByEmail } from '@/lib/db';
import { getCourseBySlug } from '@/lib/courses';

// GET - List user's purchased courses
export async function GET() {
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

        const purchases = getUserCourses(user.id);

        // Enrich with course details
        const courses = purchases.map(purchase => {
            const course = getCourseBySlug(purchase.course_slug);
            return {
                purchase: {
                    id: purchase.id,
                    purchasedAt: purchase.purchased_at,
                    amountPaid: purchase.amount_paid,
                },
                course: course ? {
                    slug: course.slug,
                    title: course.title,
                    shortDescription: course.shortDescription,
                    category: course.category,
                    level: course.level,
                    durationMinutes: course.durationMinutes,
                    topics: course.topics,
                } : null,
            };
        }).filter(item => item.course !== null);

        return NextResponse.json({
            courses,
            count: courses.length,
        });
    } catch (error) {
        console.error('Error fetching user courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}
