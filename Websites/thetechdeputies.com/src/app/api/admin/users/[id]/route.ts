import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserById, softDeleteUser, restoreUser } from '@/lib/db';

export async function GET(
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

        // Don't expose password hash
        const { passwordHash, ...safeUser } = user;

        return NextResponse.json({ user: safeUser });
    } catch (error) {
        console.error('Failed to get user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
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

        await softDeleteUser(userId);

        return NextResponse.json({ 
            success: true,
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
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

        const body = await request.json();

        if (body.action === 'restore') {
            await restoreUser(userId);
            return NextResponse.json({ 
                success: true,
                message: 'User restored successfully' 
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
