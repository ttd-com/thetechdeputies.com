import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSetting, getAllUsers } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const mailgunApiKey = getSetting('mailgun_api_key');
        const mailgunDomain = getSetting('mailgun_domain');
        const acuityUserId = getSetting('acuity_user_id');
        const acuityApiKey = getSetting('acuity_api_key');

        const users = getAllUsers();

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
