import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllUsers } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = getAllUsers();

        // Don't expose password hashes
        const safeUsers = users.map(({ password_hash, ...user }) => user);

        return NextResponse.json({
            users: safeUsers,
            total: safeUsers.length,
        });
    } catch (error) {
        console.error('Failed to get users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
