import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSetting, setSetting } from '@/lib/db';

// GET - Retrieve settings (masked)
export async function GET() {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get settings and mask sensitive values
        const mailgunApiKey = await getSetting('mailgun_api_key');
        const mailgunDomain = await getSetting('mailgun_domain');
        const acuityUserId = await getSetting('acuity_user_id');
        const acuityApiKey = await getSetting('acuity_api_key');

        return NextResponse.json({
            mailgun_api_key: mailgunApiKey ? maskSecret(mailgunApiKey) : '',
            mailgun_domain: mailgunDomain || '',
            acuity_user_id: acuityUserId || '',
            acuity_api_key: acuityApiKey ? maskSecret(acuityApiKey) : '',
        });
    } catch (error) {
        console.error('Failed to get settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Save settings
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const {
            mailgun_api_key,
            mailgun_domain,
            acuity_user_id,
            acuity_api_key
        } = await request.json();

        // Only update if value is provided and not masked
        if (mailgun_api_key && !mailgun_api_key.includes('•')) {
            await setSetting('mailgun_api_key', mailgun_api_key, true);
        }

        if (mailgun_domain !== undefined) {
            await setSetting('mailgun_domain', mailgun_domain);
        }

        if (acuity_user_id !== undefined) {
            await setSetting('acuity_user_id', acuity_user_id);
        }

        if (acuity_api_key && !acuity_api_key.includes('•')) {
            await setSetting('acuity_api_key', acuity_api_key, true);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function maskSecret(secret: string): string {
    if (secret.length <= 8) {
        return '••••••••';
    }
    return secret.substring(0, 4) + '••••••••' + secret.substring(secret.length - 4);
}
