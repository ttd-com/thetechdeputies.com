import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserById, db } from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
        }

        // Update user's email verification status
        await db.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        });

        return NextResponse.json({ 
            success: true,
            message: 'Email verified successfully' 
        });
    } catch (error) {
        console.error('Failed to verify email:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
