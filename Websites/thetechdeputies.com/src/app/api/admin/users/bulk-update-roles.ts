import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, type Role } from '@/lib/db';
import { logger } from '@/lib/logger';

// Bulk update user roles
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userIds, role }: { userIds: string[]; role: string } = await req.json();

    if (!userIds || userIds.length === 0) {
      return NextResponse.json({ error: 'No users specified' }, { status: 400 });
    }

    if (role !== 'ADMIN' && role !== 'USER') {
      return NextResponse.json({ error: 'Invalid role. Must be ADMIN or USER' }, { status: 400 });
    }

    // Coerce IDs to numbers (Prisma `id` is an Int)
    const updatePromises = userIds.map((userId: string) => {
      const idNum = Number(userId);
      return db.user.update({
        where: { id: idNum },
        data: { role: role as any, updatedAt: new Date() }
      });
    });

    const results = await Promise.all(updatePromises);

    // Log the bulk action
    logger.info('Bulk role update', {
      userIds,
      targetRole: role,
      adminId: (session.user as { id: string }).id,
      count: results.length
    });

    return NextResponse.json({
      message: `Successfully updated ${results.length} users to ${role}`,
      updatedCount: results.length
    });
  } catch (error) {
    logger.error('Failed to bulk update roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}