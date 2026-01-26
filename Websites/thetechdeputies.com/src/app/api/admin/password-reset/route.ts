import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createPasswordResetToken } from '@/lib/db';
import { z } from 'zod';

const requestResetSchema = z.object({
    email: z.string().email(),
    reason: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { email, reason } = requestResetSchema.parse(body);

        const ipAddress = req.headers.get('x-forwarded-for') || 
                         req.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const adminId = Number((session.user as { id?: string | number })?.id);
        if (!adminId) {
            return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 });
        }

        const targetUser = await db.user.findUnique({
            where: { email },
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate reset token (24 hour expiry)
        const token = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await createPasswordResetToken(targetUser.id, token, expiresAt);

        // Log admin action
        await (db as any).adminActionAudit.create({
            data: {
                adminId,
                action: 'PASSWORD_RESET_REQUEST',
                targetUserId: targetUser.id,
                targetEmail: targetUser.email,
                details: {
                    reason: reason || 'Admin initiated password reset',
                    resetMethod: 'admin_panel',
                    tokenExpiresAt: expiresAt,
                },
                ipAddress,
                userAgent,
                success: true,
            },
        });

        logger.info('Admin requested password reset for user', {
            adminId,
            targetUserId: targetUser.id,
            targetEmail: targetUser.email,
            reason,
            ipAddress,
        });

        // Send email with reset link via Mailgun
        const { emailService } = await import('@/lib/email');
        
        let emailSent = false;
        let includeTokenInResponse = true;
        
        if (emailService.isConfigured()) {
            try {
                const adminUser = await db.user.findUnique({
                    where: { id: adminId },
                    select: { name: true },
                });

                emailSent = await emailService.sendPasswordResetEmail({
                    userEmail: targetUser.email,
                    userName: targetUser.name,
                    resetToken: token,
                    adminName: adminUser?.name,
                    reason: reason || 'Admin initiated password reset',
                });

                if (!emailSent) {
                    logger.error('Failed to send password reset email', {
                        targetEmail: targetUser.email,
                        adminId,
                    });
                }

                // In production with email configured, don't include token in response
                includeTokenInResponse = !emailSent;
            } catch (emailError) {
                logger.error('Error sending password reset email', emailError);
            }
        } else {
            logger.warn('Email service not configured - returning token in response', {
                targetEmail: targetUser.email,
            });
        }

        const response: any = {
            success: true,
            message: emailSent 
                ? 'Password reset email sent successfully' 
                : 'Password reset token generated successfully',
            user: {
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.name,
            },
            emailSent,
        };

        if (includeTokenInResponse) {
            response.resetToken = token;
        }

        return NextResponse.json(response);

    } catch (error) {
        logger.error('Admin password reset request error', error, {
            action: 'admin_password_reset_request',
        });

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}