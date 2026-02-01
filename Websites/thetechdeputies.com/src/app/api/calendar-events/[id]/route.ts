import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const event = await getCalendarEvent(id);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ event });
    } catch (error) {
        console.error('Failed to get calendar event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, startTime, endTime, capacity } = body;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (endTime !== undefined) updateData.endTime = new Date(endTime);
        if (capacity !== undefined) updateData.capacity = capacity;

        const event = await updateCalendarEvent(id, updateData);

        return NextResponse.json({ event });
    } catch (error) {
        console.error('Failed to update calendar event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        await deleteCalendarEvent(id);

        return NextResponse.json({ 
            success: true,
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        console.error('Failed to delete calendar event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
