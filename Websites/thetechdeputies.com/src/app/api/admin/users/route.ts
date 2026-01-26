import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllUsers } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = await getAllUsers();

        // Don't expose password hashes
        const safeUsers = users.map(({ passwordHash, ...user }) => user);

        return NextResponse.json({
            users: safeUsers,
            total: safeUsers.length,
        });
    } catch (error) {
        console.error('Failed to get users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
