import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createBooking, getUserBookings } from '@/lib/db';
import { getCalendarEvent } from '@/lib/db';
import { emailService } from '@/lib/email';
import { generateCalendarInvite } from '@/lib/calendar-invites';

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const bookings = await getUserBookings(userId);

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Failed to get bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json(
                { error: 'Missing required field: eventId' },
                { status: 400 }
            );
        }

        const userId = parseInt(session.user.id);

        // Create booking with transaction
        const booking = await createBooking(userId, eventId);

        // Fetch event details for email
        const event = await getCalendarEvent(eventId);
        
        if (event) {
            // Generate calendar invite
            const icsContent = await generateCalendarInvite({
                title: event.title,
                description: event.description || '',
                startTime: event.startTime,
                endTime: event.endTime,
                organizerName: 'The Tech Deputies',
                organizerEmail: process.env.MAILGUN_FROM_EMAIL || 'noreply@thetechdeputies.com',
            });

            // Send confirmation email
            await emailService.sendBookingConfirmationEmail({
                userEmail: session.user.email!,
                userName: session.user.name,
                eventTitle: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
                icsContent,
            });
        }

        return NextResponse.json({ booking }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create booking:', error);
        
        if (error.message === 'Event is full') {
            return NextResponse.json({ error: 'Event is full' }, { status: 409 });
        }
        
        if (error.message === 'User already has a booking for this event') {
            return NextResponse.json({ error: 'You already have a booking for this event' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
