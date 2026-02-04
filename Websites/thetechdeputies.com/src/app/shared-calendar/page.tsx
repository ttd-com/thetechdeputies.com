'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SharedCalendarBooking {
  id: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  event: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
  };
  bookedAt: string;
}

export default function SharedCalendarPage() {
  const [bookings, setBookings] = useState<SharedCalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/shared-calendar');
        if (!response.ok) {
          throw new Error('Failed to fetch shared calendar');
        }
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shared Calendar</h1>
          <p className="text-gray-600">
            View all upcoming sessions and who's attending
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No upcoming sessions scheduled</p>
            <Link
              href="/booking"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Book a Session
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const startTime = new Date(booking.event.startTime);
              const endTime = new Date(booking.event.endTime);
              const bookedDate = new Date(booking.bookedAt);

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.event.title}</h3>
                      {booking.event.description && (
                        <p className="text-gray-600 mt-1">{booking.event.description}</p>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      <div className="text-sm text-gray-500">
                        Booked {bookedDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium text-gray-900">
                        {startTime.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {endTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Attendee:</span>
                      <p className="font-medium text-gray-900">
                        {booking.user.name || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Capacity: {booking.event.bookedCount} / {booking.event.capacity}
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(booking.event.bookedCount / booking.event.capacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/booking"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View Available Slots & Book
          </Link>
        </div>
      </div>
    </div>
  );
}
