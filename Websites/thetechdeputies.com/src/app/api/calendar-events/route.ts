import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCalendarEvent, getCalendarEvents } from '@/lib/db';

export async function GET(request: Request) {
    console.log('[API] GET /api/calendar-events - Starting request');
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        console.log('[API] Query params:', { startDate, endDate });
        console.log('[API] Calling getCalendarEvents...');

        const events = await getCalendarEvents(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        console.log('[API] Got events:', events?.length);
        return NextResponse.json({ events });
    } catch (error) {
        console.error('Failed to get calendar events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, startTime, endTime, capacity } = body;

        if (!title || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required fields: title, startTime, endTime' },
                { status: 400 }
            );
        }

        const adminId = parseInt(session.user?.id as string);
        if (isNaN(adminId)) {
            return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
        }

        const event = await createCalendarEvent({
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            capacity: capacity || 2, // Default to 2
            adminId,
        });

        return NextResponse.json({ event }, { status: 201 });
    } catch (error) {
        console.error('Failed to create calendar event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
