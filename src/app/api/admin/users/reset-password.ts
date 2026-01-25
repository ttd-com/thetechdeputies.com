import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Send password reset email
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate reset token (simplified version - in real app would be more secure)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        token: resetToken,
        userId,
        expiresAt,
      }
    });

    logger.info('Password reset requested', {
      userId,
      adminId: (session.user as { id: string }).id
    });

    return NextResponse.json({
      message: 'Password reset email sent successfully',
      token: resetToken // For demo purposes - would normally email this
    });
  } catch (error) {
    logger.error('Failed to send password reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}