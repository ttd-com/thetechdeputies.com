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
        const totalUsers = users.length;
        const adminUsers = users.filter(u => (u.role as string) === 'ADMIN').length;

        // Count users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;

        return NextResponse.json({
            totalUsers,
            adminUsers,
            recentUsers,
        });
    } catch (error) {
        console.error('Failed to get stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
