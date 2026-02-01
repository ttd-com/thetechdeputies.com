/**
 * @file page.tsx
 * @description Booking page for scheduling tech support sessions.
 * Users can view available time slots and book appointments.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatSlotRange, formatCalendarDate } from '@/lib/calendar';

interface CalendarEvent {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
}

export default function BookingPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {
            // Get events for the next 30 days
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            const response = await fetch(
                `/api/calendar-events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );

            if (response.ok) {
                const data = await response.json();
                // Filter to future events only
                const futureEvents = data.events.filter(
                    (e: CalendarEvent) => new Date(e.startTime) > new Date()
                );
                setEvents(futureEvents);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleBooking(eventId: string, eventTitle: string) {
        if (status !== 'authenticated') {
            if (confirm('You need to be logged in to book a session. Go to login?')) {
                router.push(`/login?callbackUrl=/booking`);
            }
            return;
        }

        if (!confirm(`Book "${eventTitle}"?`)) return;

        setBooking(eventId);
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });

            if (response.ok) {
                alert('Booking confirmed! Check your email for confirmation.');
                router.push('/dashboard/sessions');
            } else {
                const data = await response.json();
                alert(`Failed to book: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to book:', error);
            alert('Failed to book session');
        } finally {
            setBooking(null);
        }
    }

    const availableSlots = events.filter(e => e.bookedCount < e.capacity);
    const groupedByDate = availableSlots.reduce((acc, event) => {
        const date = new Date(event.startTime).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
        <>
            {/* Page Header */}
            <section
                className="bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-12"
                aria-labelledby="booking-heading"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1
                            id="booking-heading"
                            className="text-4xl md:text-5xl font-bold text-secondary mb-4"
                        >
                            Book a Session
                        </h1>
                        <p className="text-lg text-muted-foreground mb-4">
                            Ready to get help with your tech questions? Choose a time that
                            works for you and we&apos;ll take it from there. All sessions
                            include patient, jargon-free support.
                        </p>
                    </div>
                </div>
            </section>

            {/* Available Sessions */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">
                            Available Time Slots
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        ) : Object.keys(groupedByDate).length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
                                    No Available Slots
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    There are no available time slots at the moment. Please check back later or contact us directly.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {Object.entries(groupedByDate).map(([dateStr, dayEvents]) => (
                                    <div key={dateStr}>
                                        <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                                            {formatCalendarDate(new Date(dateStr))}
                                        </h3>
                                        <div className="grid gap-4">
                                            {dayEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                                                                {event.title}
                                                            </h4>
                                                            {event.description && (
                                                                <p className="text-gray-600 text-sm mb-3">
                                                                    {event.description}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {formatSlotRange(new Date(event.startTime), new Date(event.endTime))}
                                                                </span>
                                                                <span className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                    </svg>
                                                                    {event.capacity - event.bookedCount} spots left
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleBooking(event.id, event.title)}
                                                            disabled={booking === event.id}
                                                            className="ml-4 px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {booking === event.id ? 'Booking...' : 'Book Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
