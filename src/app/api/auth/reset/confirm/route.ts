import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
    getPasswordResetToken,
    markTokenAsUsed,
    updateUserPassword
} from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Get token from database
        const resetToken = getPasswordResetToken(token);

        if (!resetToken) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Check if token is already used
        if (resetToken.used) {
            return NextResponse.json(
                { error: 'This reset link has already been used' },
                { status: 400 }
            );
        }

        // Check if token is expired
        const expiresAt = new Date(resetToken.expires_at);
        if (expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'This reset link has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update user's password
        updateUserPassword(resetToken.user_id, passwordHash);

        // Mark token as used
        markTokenAsUsed(token);

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
