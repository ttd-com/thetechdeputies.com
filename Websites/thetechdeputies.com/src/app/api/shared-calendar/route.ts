import { NextResponse } from 'next/server';
import { getSharedCalendarBookings } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const bookings = await getSharedCalendarBookings(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Failed to get shared calendar bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
