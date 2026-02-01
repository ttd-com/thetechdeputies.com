/**
 * @file email.ts
 * @description Mailgun email service for sending transactional emails.
 * Supports password reset emails and admin notifications.
 */

import { logger } from './logger';

export interface EmailData {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
    attachments?: {
        filename: string;
        content: string | Buffer;
        contentType: string;
    }[];
}

export interface BookingEmailData {
    userEmail: string;
    userName?: string | null;
    eventTitle: string;
    startTime: Date;
    endTime: Date;
    icsContent?: string;
}

export interface TemporaryPasswordEmailData {
    userEmail: string;
    userName?: string | null;
    temporaryPassword: string;
}

export interface PasswordResetEmailData {
    userEmail: string;
    userName?: string | null;
    resetToken: string;
    adminName?: string | null;
    reason?: string;
}

export interface AdminNotificationEmailData {
    adminEmail: string;
    adminName?: string | null;
    action: string;
    targetUser: {
        email: string;
        name?: string | null;
    };
    details?: any;
    timestamp: Date;
}

class EmailService {
    private apiKey: string;
    private domain: string;
    private fromEmail: string;

    constructor() {
        this.apiKey = process.env.MAILGUN_API_KEY || '';
        this.domain = process.env.MAILGUN_DOMAIN || '';
        this.fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${this.domain}`;

        if (!this.apiKey || !this.domain) {
            logger.warn('Mailgun configuration missing. Email service will be disabled.');
        }
    }

    private getBaseUrl(): string {
        const env = process.env.NODE_ENV;
        if (env === 'production') {
            return process.env.NEXTAUTH_URL || 'https://thetechdeputies.com';
        }
        return 'http://localhost:3000';
    }

    async sendEmail(data: EmailData): Promise<boolean> {
        if (!this.apiKey || !this.domain) {
            logger.warn('Email service not configured', { to: data.to, subject: data.subject });
            return false;
        }

        try {
            const auth = Buffer.from(`api:${this.apiKey}`).toString('base64');
            
            const formData = new FormData();
            formData.append('from', data.from || this.fromEmail);
            formData.append('to', Array.isArray(data.to) ? data.to.join(',') : data.to);
            formData.append('subject', data.subject);
            formData.append('html', data.html);
            if (data.text) {
                formData.append('text', data.text);
            }
            if (data.replyTo) {
                formData.append('h:Reply-To', data.replyTo);
            }

            if (data.attachments) {
                for (const attachment of data.attachments) {
                    const content = typeof attachment.content === 'string' 
                        ? attachment.content 
                        : Buffer.from(attachment.content).toString('base64');
                    const blob = new Blob([content], { type: attachment.contentType });
                    formData.append('attachment', blob, attachment.filename);
                }
            }

            const response = await fetch(
                `https://api.mailgun.net/v3/${this.domain}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Mailgun API error: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            logger.info('Email sent successfully', {
                to: data.to,
                subject: data.subject,
                messageId: result.id,
            });

            return true;
        } catch (error) {
            logger.error('Failed to send email', error, {
                to: data.to,
                subject: data.subject,
            });
            return false;
        }
    }

    async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
        const resetUrl = `${this.getBaseUrl()}/auth/reset?token=${data.resetToken}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset - The Tech Deputies</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #39918C; font-size: 24px; font-weight: bold; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
                    .button { display: inline-block; background: #39918C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; font-size: 12px; color: #666; }
                    .reason { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">The Tech Deputies</div>
                        <h1>Password Reset Request</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello ${data.userName || 'there'},</p>
                        
                        <p>A password reset has been requested for your account at The Tech Deputies.</p>
                        
                        ${data.reason ? `
                        <div class="reason">
                            <strong>Reason:</strong> ${data.reason}
                        </div>
                        ` : ''}
                        
                        <p>Click the button below to reset your password:</p>
                        
                        <a href="${resetUrl}" class="button">Reset Password</a>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                            ${resetUrl}
                        </p>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This link will expire in 24 hours</li>
                            <li>If you didn't request this reset, please contact us immediately</li>
                            <li>Never share this link with anyone</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message from The Tech Deputies.</p>
                        <p>If you have questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
            Password Reset Request - The Tech Deputies
            
            Hello ${data.userName || 'there'},
            
            A password reset has been requested for your account at The Tech Deputies.
            
            ${data.reason ? `Reason: ${data.reason}\n` : ''}
            
            Click this link to reset your password:
            ${resetUrl}
            
            Important:
            - This link will expire in 24 hours
            - If you didn't request this reset, please contact us immediately
            - Never share this link with anyone
            
            This is an automated message from The Tech Deputies.
        `;

        return this.sendEmail({
            to: data.userEmail,
            subject: 'Password Reset - The Tech Deputies',
            html,
            text,
        });
    }

    async sendAdminNotificationEmail(data: AdminNotificationEmailData): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admin Action Notification - The Tech Deputies</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #39918C; font-size: 24px; font-weight: bold; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
                    .action-type { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 15px 0; }
                    .details { background: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; }
                    .footer { text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">The Tech Deputies</div>
                        <h1>Admin Action Notification</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello ${data.adminName || 'Admin'},</p>
                        
                        <p>An administrative action was performed on The Tech Deputies platform:</p>
                        
                        <div class="action-type">
                            <strong>Action:</strong> ${data.action}<br>
                            <strong>Target User:</strong> ${data.targetUser.email}<br>
                            <strong>Timestamp:</strong> ${data.timestamp.toLocaleString()}
                        </div>
                        
                        ${data.targetUser.name ? `<p><strong>Target Name:</strong> ${data.targetUser.name}</p>` : ''}
                        
                        ${data.details ? `
                        <h3>Details:</h3>
                        <div class="details">
                            ${JSON.stringify(data.details, null, 2)}
                        </div>
                        ` : ''}
                        
                        <p>If this action was not authorized, please contact the security team immediately.</p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated security notification from The Tech Deputies.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
            Admin Action Notification - The Tech Deputies
            
            Hello ${data.adminName || 'Admin'},
            
            An administrative action was performed on The Tech Deputies platform:
            
            Action: ${data.action}
            Target User: ${data.targetUser.email}
            Timestamp: ${data.timestamp.toLocaleString()}
            
            ${data.targetUser.name ? `Target Name: ${data.targetUser.name}` : ''}
            
            ${data.details ? `Details:\n${JSON.stringify(data.details, null, 2)}` : ''}
            
            If this action was not authorized, please contact the security team immediately.
            
            This is an automated security notification from The Tech Deputies.
        `;

        return this.sendEmail({
            to: data.adminEmail,
            subject: `Admin Action: ${data.action} - The Tech Deputies`,
            html,
            text,
        });
    }

    async sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
        const dateStr = data.startTime.toLocaleDateString();
        const timeStr = `${data.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${data.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Booking Confirmation - The Tech Deputies</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
                    .details { background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #ddd; margin: 20px 0; }
                    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #39918C;">Booking Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${data.userName || 'there'},</p>
                        <p>Your booking for <strong>${data.eventTitle}</strong> has been confirmed.</p>
                        <div class="details">
                            <p><strong>Date:</strong> ${dateStr}</p>
                            <p><strong>Time:</strong> ${timeStr}</p>
                        </div>
                        <p>A calendar invitation is attached to this email.</p>
                        <p>If you need to cancel or reschedule, please visit your dashboard.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} The Tech Deputies. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const attachments = data.icsContent ? [
            {
                filename: 'invite.ics',
                content: data.icsContent,
                contentType: 'text/calendar',
            }
        ] : [];

        return this.sendEmail({
            to: data.userEmail,
            subject: `Confirmed: ${data.eventTitle} - The Tech Deputies`,
            html,
            text: `Your booking for ${data.eventTitle} on ${dateStr} at ${timeStr} is confirmed.`,
            attachments
        });
    }

    async sendBookingCancellationEmail(data: BookingEmailData): Promise<boolean> {
        const dateStr = data.startTime.toLocaleDateString();
        const timeStr = `${data.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${data.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Booking Cancelled - The Tech Deputies</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .content { background: #fff5f5; padding: 30px; border-radius: 8px; border: 1px solid #feb2b2; }
                    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <h1 style="color: #c53030;">Booking Cancelled</h1>
                        <p>Hello ${data.userName || 'there'},</p>
                        <p>Your booking for <strong>${data.eventTitle}</strong> on ${dateStr} at ${timeStr} has been cancelled.</p>
                        <p>If you did not request this, please contact us.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} The Tech Deputies. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: data.userEmail,
            subject: `Cancelled: ${data.eventTitle} - The Tech Deputies`,
            html,
            text: `Your booking for ${data.eventTitle} on ${dateStr} at ${timeStr} has been cancelled.`,
        });
    }

    async sendTemporaryPasswordEmail(data: TemporaryPasswordEmailData): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Temporary Password - The Tech Deputies</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .content { background: #f7fafc; padding: 30px; border-radius: 8px; }
                    .password-box { background: #edf2f7; padding: 15px; border-radius: 4px; text-align: center; font-family: monospace; font-size: 20px; margin: 20px 0; border: 1px dashed #cbd5e0; }
                    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <h1 style="color: #39918C;">Temporary Password</h1>
                        <p>Hello ${data.userName || 'there'},</p>
                        <p>An administrator has reset your password. Please use the temporary password below to log in and change your password immediately.</p>
                        <div class="password-box">${data.temporaryPassword}</div>
                        <p>For security reasons, do not share this password with anyone.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} The Tech Deputies. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: data.userEmail,
            subject: 'Your Temporary Password - The Tech Deputies',
            html,
            text: `Your temporary password is: ${data.temporaryPassword}. Please log in and change it.`,
        });
    }

    async sendSubscriptionConfirmationEmail(userEmail: string, planName: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .footer { padding: 15px 20px; background: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
                    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to ${planName}!</h1>
                    </div>
                    <div class="content">
                        <p>Thank you for subscribing to the ${planName} plan. Your subscription is now active.</p>
                        <p>You now have access to:</p>
                        <ul>
                            <li>Your planned benefits</li>
                            <li>Course materials</li>
                            <li>Booking system for consultations</li>
                        </ul>
                        <a href="${this.getBaseUrl()}/dashboard/subscriptions" class="button">View Your Subscription</a>
                    </div>
                    <div class="footer">
                        <p>If you have any questions, contact us at support@thetechdeputies.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: userEmail,
            subject: `Welcome to ${planName}! - The Tech Deputies`,
            html,
            text: `Welcome to ${planName}! Your subscription is now active. Visit ${this.getBaseUrl()}/dashboard/subscriptions to get started.`,
        });
    }

    async sendSubscriptionCancelledEmail(userEmail: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background: #f85454; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .footer { padding: 15px 20px; background: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Subscription Cancelled</h1>
                    </div>
                    <div class="content">
                        <p>Your subscription with The Tech Deputies has been cancelled.</p>
                        <p>You will retain access to your current plan until the end of your billing period.</p>
                        <p>We'd love to have you back! If you'd like to reactivate your subscription, visit our subscriptions page.</p>
                    </div>
                    <div class="footer">
                        <p>If you have questions or feedback, contact us at support@thetechdeputies.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: userEmail,
            subject: 'Subscription Cancelled - The Tech Deputies',
            html,
            text: 'Your subscription has been cancelled. You will retain access until the end of your billing period.',
        });
    }

    isConfigured(): boolean {
        return !!(this.apiKey && this.domain);
    }
}

export const emailService = new EmailService();

// Export convenience functions
export async function sendSubscriptionConfirmationEmail(email: string, planName: string) {
    return emailService.sendSubscriptionConfirmationEmail(email, planName);
}

export async function sendSubscriptionCancelledEmail(email: string) {
    return emailService.sendSubscriptionCancelledEmail(email);
}