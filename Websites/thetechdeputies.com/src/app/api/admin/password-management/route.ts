import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    userId: z.number(),
    newPassword: z.string().min(8),
    forceChangeOnNextLogin: z.boolean().default(false),
});

const forceChangePasswordSchema = z.object({
    userId: z.number(),
    newPassword: z.string().min(8),
    reason: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { action } = body;

        const ipAddress = req.headers.get('x-forwarded-for') || 
                         req.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const adminId = Number((session.user as { id?: string | number })?.id);
        if (!adminId) {
            return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 });
        }

        if (action === 'reset') {
            const { userId, newPassword, forceChangeOnNextLogin } = resetPasswordSchema.parse(body);

            const targetUser = await db.user.findUnique({
                where: { id: userId },
            });

            if (!targetUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const passwordHash = await bcrypt.hash(newPassword, 12);

            await db.user.update({
                where: { id: userId },
                data: { passwordHash },
            });

            // Log password change audit
            await db.passwordChangeAudit.create({
                data: {
                    userId,
                    changedBy: adminId,
                    changeType: 'admin_reset' as any,
                    ipAddress,
                    userAgent,
                    success: true,
                },
            });

            // Log admin action
            await db.adminActionAudit.create({
                data: {
                    adminId,
                    action: 'PASSWORD_RESET',
                    targetUserId: userId,
                    targetEmail: targetUser.email,
                    details: {
                        forceChangeOnNextLogin,
                        resetMethod: 'admin_panel',
                    },
                    ipAddress,
                    userAgent,
                    success: true,
                },
            });

            logger.info('Admin reset user password', {
                adminId,
                targetUserId: userId,
                targetEmail: targetUser.email,
                ipAddress,
            });

            // Send admin notification email
            const { emailService } = await import('@/lib/email');
            if (emailService.isConfigured()) {
                try {
                    const adminUser = await db.user.findUnique({
                        where: { id: adminId },
                        select: { email: true, name: true },
                    });

                    if (adminUser) {
                        await emailService.sendAdminNotificationEmail({
                            adminEmail: adminUser.email,
                            adminName: adminUser.name,
                            action: 'PASSWORD_RESET',
                            targetUser: {
                                email: targetUser.email,
                                name: targetUser.name,
                            },
                            details: {
                                forceChangeOnNextLogin,
                                resetMethod: 'admin_panel',
                            },
                            timestamp: new Date(),
                        });
                    }
                } catch (emailError) {
                    logger.error('Failed to send admin notification email', emailError);
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Password reset successfully',
                user: {
                    id: targetUser.id,
                    email: targetUser.email,
                    name: targetUser.name,
                },
            });

        } else if (action === 'force-change') {
            const { userId, newPassword, reason } = forceChangePasswordSchema.parse(body);

            const targetUser = await db.user.findUnique({
                where: { id: userId },
            });

            if (!targetUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const passwordHash = await bcrypt.hash(newPassword, 12);

            await db.user.update({
                where: { id: userId },
                data: { passwordHash },
            });

            // Log password change audit
            await db.passwordChangeAudit.create({
                data: {
                    userId,
                    changedBy: adminId,
                    changeType: 'admin_force_change' as any,
                    ipAddress,
                    userAgent,
                    success: true,
                },
            });

            // Log admin action
            await db.adminActionAudit.create({
                data: {
                    adminId,
                    action: 'FORCE_PASSWORD_CHANGE',
                    targetUserId: userId,
                    targetEmail: targetUser.email,
                    details: {
                        reason: reason || 'Security requirement',
                        changeMethod: 'admin_panel',
                    },
                    ipAddress,
                    userAgent,
                    success: true,
                },
            });

            logger.info('Admin forced password change', {
                adminId,
                targetUserId: userId,
                targetEmail: targetUser.email,
                reason,
                ipAddress,
            });

            // Send admin notification email
            const { emailService } = await import('@/lib/email');
            if (emailService.isConfigured()) {
                try {
                    const adminUser = await db.user.findUnique({
                        where: { id: adminId },
                        select: { email: true, name: true },
                    });

                    if (adminUser) {
                        await emailService.sendAdminNotificationEmail({
                            adminEmail: adminUser.email,
                            adminName: adminUser.name,
                            action: 'FORCE_PASSWORD_CHANGE',
                            targetUser: {
                                email: targetUser.email,
                                name: targetUser.name,
                            },
                            details: {
                                reason: reason || 'Security requirement',
                                changeMethod: 'admin_panel',
                            },
                            timestamp: new Date(),
                        });
                    }
                } catch (emailError) {
                    logger.error('Failed to send admin notification email', emailError);
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Password force changed successfully',
                user: {
                    id: targetUser.id,
                    email: targetUser.email,
                    name: targetUser.name,
                },
            });

        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        logger.error('Admin password management error', error, {
            action: 'admin_password_management',
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