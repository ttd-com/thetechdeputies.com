import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserById } from '@/lib/db';
import { emailService } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { updateUserPassword } from '@/lib/db';

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

        // Generate a temporary password (8 random alphanumeric characters)
        const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        
        // Hash the temporary password
        const passwordHash = await bcrypt.hash(temporaryPassword, 12);
        
        // Update the user's password
        await updateUserPassword(userId, passwordHash);

        // Send email with temporary password
        const emailSent = await emailService.sendTemporaryPasswordEmail({
            userEmail: user.email,
            userName: user.name,
            temporaryPassword,
        });

        if (!emailSent) {
            return NextResponse.json(
                { 
                    error: 'Password was reset but email failed to send. Please contact the user directly.',
                    temporaryPassword // Include it in response so admin can share it manually
                },
                { status: 207 } // Multi-status
            );
        }

        return NextResponse.json({ 
            success: true,
            message: 'Password reset successfully. User will receive an email with their temporary password.' 
        });
    } catch (error) {
        console.error('Failed to reset password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
