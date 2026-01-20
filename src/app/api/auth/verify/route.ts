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
        const verificationToken = await getEmailVerificationToken(token);

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Check if token has expired
        const expiresAt = new Date(verificationToken.expiresAt);
        if (expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Verification token has expired. Please register again.' },
                { status: 400 }
            );
        }

        // Verify the user's email
        await verifyUserEmail(verificationToken.userId);

        // Get user info for response
        const user = await getUserById(verificationToken.userId);

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
