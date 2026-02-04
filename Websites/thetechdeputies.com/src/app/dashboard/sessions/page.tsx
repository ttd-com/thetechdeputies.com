'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatSlotRange, formatCalendarDate } from '@/lib/calendar';

interface Booking {
    id: string;
    bookedAt: string;
    cancelledAt: string | null;
    status: string;
    event: {
        id: string;
        title: string;
        description: string | null;
        startTime: string;
        endTime: string;
    };
}

export default function SessionsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            const response = await fetch('/api/bookings');
            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancelBooking(bookingId: string, eventTitle: string) {
        if (!confirm(`Cancel booking for "${eventTitle}"?`)) return;

        setCanceling(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Booking cancelled successfully');
                loadBookings();
            } else {
                const data = await response.json();
                alert(`Failed to cancel booking: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            alert('Failed to cancel booking');
        } finally {
            setCanceling(null);
        }
    }

    const upcomingBookings = bookings.filter(b => {
        return b.status === 'CONFIRMED' && new Date(b.event.endTime) > new Date();
    });

    const pastBookings = bookings.filter(b => {
        return b.status === 'CANCELLED' || new Date(b.event.endTime) <= new Date();
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                    My Sessions
                </h1>
                <p className="text-gray-600 mt-2">
                    View and manage your upcoming and past appointments.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Upcoming Sessions */}
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                            Upcoming Sessions
                        </h2>
                        {upcomingBookings.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
                                    No Upcoming Sessions
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    You don&apos;t have any scheduled sessions. Book your first tech support session to get started!
                                </p>
                                <button
                                    onClick={() => router.push('/booking')}
                                    className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Book a Session
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {upcomingBookings.map((booking) => (
                                    <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                                                    {booking.event.title}
                                                </h3>
                                                {booking.event.description && (
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {booking.event.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatCalendarDate(new Date(booking.event.startTime))}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatSlotRange(new Date(booking.event.startTime), new Date(booking.event.endTime))}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCancelBooking(booking.id, booking.event.title)}
                                                disabled={canceling === booking.id}
                                                className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {canceling === booking.id ? 'Canceling...' : 'Cancel'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past Sessions */}
                    {pastBookings.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                                Past Sessions
                            </h2>
                            <div className="grid gap-4">
                                {pastBookings.map((booking) => (
                                    <div key={booking.id} className="bg-gray-50 rounded-xl p-6 opacity-75">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                                                        {booking.event.title}
                                                    </h3>
                                                    {booking.status === 'cancelled' && (
                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                            Cancelled
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatCalendarDate(new Date(booking.event.startTime))}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatSlotRange(new Date(booking.event.startTime), new Date(booking.event.endTime))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
