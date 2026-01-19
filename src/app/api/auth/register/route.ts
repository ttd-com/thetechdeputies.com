import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createUser, getUserByEmail, createEmailVerificationToken, getSetting } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user (first user becomes admin automatically)
        const user = createUser(email, passwordHash, name);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        createEmailVerificationToken(user.id, verificationToken, expiresAt);

        // Send verification email
        const mailgunApiKey = getSetting('mailgun_api_key') || process.env.MAILGUN_API_KEY;
        const mailgunDomain = getSetting('mailgun_domain') || process.env.MAILGUN_DOMAIN;
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

        if (mailgunApiKey && mailgunDomain) {
            try {
                const formData = new FormData();
                formData.append('from', `The Tech Deputies <noreply@${mailgunDomain}>`);
                formData.append('to', email);
                formData.append('subject', 'Verify your email - The Tech Deputies');
                formData.append('html', `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2F435A;">Welcome to The Tech Deputies! 🤠</h1>
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for creating an account. Please verify your email address to get started.</p>
            <p style="margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="background-color: #39918C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">The Tech Deputies - Your trusted partners for tech education</p>
          </div>
        `);

                const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    console.error('Mailgun error:', await response.text());
                }
            } catch (error) {
                console.error('Failed to send verification email:', error);
            }
        } else {
            // Log for development
            console.log('='.repeat(50));
            console.log('EMAIL VERIFICATION (Mailgun not configured)');
            console.log(`To: ${email}`);
            console.log(`Verify URL: ${verifyUrl}`);
            console.log('='.repeat(50));
        }

        return NextResponse.json({
            success: true,
            message: 'Account created! Please check your email to verify your account.',
            requiresVerification: true,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}
