import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import {
    getUserByEmail,
    createPasswordResetToken,
    checkRateLimit,
    getSetting
} from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
            headersList.get('x-real-ip') ||
            'unknown';

        // Rate limiting: 5 attempts per hour
        const allowed = await checkRateLimit(ip, 'password-reset', 5, 60);
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many reset attempts. Please try again in an hour.' },
                { status: 429 }
            );
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Always return success to prevent email enumeration
        const successResponse = {
            message: 'If an account exists with this email, you will receive a password reset link.',
        };

        const user = await getUserByEmail(email);
        if (!user) {
            // Return success even if user doesn't exist (prevents enumeration)
            return NextResponse.json(successResponse);
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await createPasswordResetToken(user.id, token, expiresAt);

        // Check if Mailgun is configured
        const mailgunApiKey = await getSetting('mailgun_api_key') || process.env.MAILGUN_API_KEY;
        const mailgunDomain = await getSetting('mailgun_domain') || process.env.MAILGUN_DOMAIN;

        if (mailgunApiKey && mailgunDomain) {
            // Send email via Mailgun
            const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const resetUrl = `${siteUrl}/reset-password?token=${token}`;

            try {
                const formData = new FormData();
                formData.append('from', `The Tech Deputies <noreply@${mailgunDomain}>`);
                formData.append('to', email);
                formData.append('subject', 'Reset Your Password');
                formData.append('html', `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #39918C;">Reset Your Password</h2>
            <p>Hi${user.name ? ` ${user.name}` : ''},</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <p style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #39918C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              The Tech Deputies - Tech Education & Support
            </p>
          </div>
        `);

                const response = await fetch(
                    `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
                        },
                        body: formData,
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    logger.error('Mailgun API Error', { status: response.status, response: errorText });
                } else {
                    logger.info('Password reset email sent', { email: email, domain: mailgunDomain });
                }
            } catch (emailError) {
                logger.error('Error sending password reset email', emailError, { email });
                // Don't fail the request - user can still use token if they have it
            }
        } else {
            // Mailgun not configured - log token for dev purposes or warn in production
            logger.warn('Mailgun not configured - password reset token generated but not sent', {
                email,
                token,
                mailgunApiKeyPresent: !!mailgunApiKey,
                mailgunDomainPresent: !!mailgunDomain
            });

            if (process.env.NODE_ENV !== 'production') {
                console.log('='.repeat(60));
                console.log('PASSWORD RESET TOKEN (Mailgun not configured)');
                console.log(`Email: ${email}`);
                console.log(`Token: ${token}`);
                console.log(`Reset URL: http://localhost:3000/reset-password?token=${token}`);
                console.log('='.repeat(60));
            }
        }

        return NextResponse.json(successResponse);
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
