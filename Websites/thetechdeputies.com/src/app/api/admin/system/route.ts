import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSetting, getAllUsers } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const mailgunApiKey = await getSetting('mailgun_api_key');
        const mailgunDomain = await getSetting('mailgun_domain');
        const acuityUserId = await getSetting('acuity_user_id');
        const acuityApiKey = await getSetting('acuity_api_key');

        const users = await getAllUsers();

        return NextResponse.json({
            mailgun: {
                configured: !!(mailgunApiKey && mailgunDomain),
                domain: mailgunDomain || undefined,
            },
            acuity: {
                configured: !!(acuityUserId && acuityApiKey),
            },
            database: {
                status: 'ok',
                userCount: users.length,
            },
        });
    } catch (error) {
        console.error('Failed to get system status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
