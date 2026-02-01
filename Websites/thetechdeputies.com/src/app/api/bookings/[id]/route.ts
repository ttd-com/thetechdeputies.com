import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBooking, cancelBooking, getCalendarEvent } from '@/lib/db';
import { emailService } from '@/lib/email';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const booking = await getBooking(id);

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Users can only view their own bookings (unless admin)
        const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';
        const isOwner = booking.userId === parseInt(session.user.id);

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ booking });
    } catch (error) {
        console.error('Failed to get booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const booking = await getBooking(id);

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Users can only cancel their own bookings (unless admin)
        const isAdmin = (session.user as { role?: string })?.role === 'ADMIN';
        const isOwner = booking.userId === parseInt(session.user.id);

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await cancelBooking(id);

        // Send cancellation email
        const event = await getCalendarEvent(booking.eventId);
        if (event) {
            await emailService.sendBookingCancellationEmail({
                userEmail: booking.user.email,
                userName: booking.user.name,
                eventTitle: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
            });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Booking cancelled successfully' 
        });
    } catch (error) {
        console.error('Failed to cancel booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
