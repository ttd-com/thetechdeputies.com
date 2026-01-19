import { NextResponse } from 'next/server';
import { getEmailVerificationToken, verifyUserEmail, getUserById } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Get token from database
        const verificationToken = getEmailVerificationToken(token);

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Check if token has expired
        const expiresAt = new Date(verificationToken.expires_at);
        if (expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Verification token has expired. Please register again.' },
                { status: 400 }
            );
        }

        // Verify the user's email
        verifyUserEmail(verificationToken.user_id);

        // Get user info for response
        const user = getUserById(verificationToken.user_id);

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully! You can now sign in.',
            email: user?.email,
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'An error occurred during verification' },
            { status: 500 }
        );
    }
}
