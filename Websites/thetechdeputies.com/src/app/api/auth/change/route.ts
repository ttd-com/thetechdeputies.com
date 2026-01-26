import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { getUserById, updateUserPassword } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
        }

        const userId = parseInt(session.user.id as string, 10);
        const user = await getUserById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        await updateUserPassword(userId, hashed);

        return NextResponse.json({ success: true, message: 'Password changed' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
