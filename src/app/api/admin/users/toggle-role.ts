import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Toggle user role (ADMIN <-> USER)
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (role !== 'ADMIN' && role !== 'USER') {
      return NextResponse.json({ error: 'Invalid role. Must be ADMIN or USER' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Toggle role
    const newRole = currentUser.role === 'USER' ? 'ADMIN' : 'USER';
    
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole, updatedAt: new Date() }
    });

    // Log the action
    logger.info('Role toggled', {
      userId,
      oldRole: currentUser.role,
      newRole,
      adminId: (session.user as { id: string }).id
    });

    return NextResponse.json({
      message: 'Role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });
  } catch (error) {
    logger.error('Failed to toggle role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}