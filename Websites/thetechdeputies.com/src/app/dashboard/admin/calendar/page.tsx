/**
 * @file page.tsx
 * @description Admin calendar management page - view, create, edit calendar slots
 */

'use client';

import { useEffect, useState } from 'react';
import { formatSlotRange, formatCalendarDate } from '@/lib/calendar';

interface CalendarEvent {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    adminId: number;
    createdAt: string;
    bookings?: Array<{
        id: string;
        user: {
            name: string | null;
            email: string;
        };
        status: string;
    }>;
}

export default function AdminCalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Tech Support Session',
        description: '30-minute or 1-hour tech support session. One-on-one guidance with patient, jargon-free explanations.',
        date: '',
        startTime: '10:00',
        duration: '60',
        capacity: '2',
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {
            setLoading(true);
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 60); // Next 60 days

            const response = await fetch(
                `/api/calendar-events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );

            if (response.ok) {
                const data = await response.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateEvent(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        setError(null);

        try {
            const [hours, minutes] = formData.startTime.split(':');
            const startDate = new Date(formData.date);
            startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + parseInt(formData.duration));

            const response = await fetch('/api/calendar-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    startTime: startDate.toISOString(),
                    endTime: endDate.toISOString(),
                    capacity: parseInt(formData.capacity),
                }),
            });

            if (response.ok) {
                setShowCreateForm(false);
                setFormData({
                    title: 'Tech Support Session',
                    description: '30-minute or 1-hour tech support session. One-on-one guidance with patient, jargon-free explanations.',
                    date: '',
                    startTime: '10:00',
                    duration: '60',
                    capacity: '2',
                });
                await loadEvents();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create event');
            }
        } catch (error) {
            console.error('Failed to create event:', error);
            setError('Failed to create event');
        } finally {
            setCreating(false);
        }
    }

    async function handleDeleteEvent(eventId: string) {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await fetch(`/api/calendar-events/${eventId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadEvents();
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event');
        }
    }

    function groupEventsByDate(events: CalendarEvent[]) {
        const grouped: Record<string, CalendarEvent[]> = {};
        
        events.forEach(event => {
            const date = new Date(event.startTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(event);
        });
        
        return grouped;
    }

    const groupedEvents = groupEventsByDate(events);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
                    <p className="text-gray-600 mt-1">Manage available time slots for bookings</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showCreateForm ? 'Cancel' : 'Create New Slot'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Create Calendar Slot</h2>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes)
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Capacity
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={creating}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {creating ? 'Creating...' : 'Create Event'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                    <p className="text-gray-500 text-lg">No calendar events found</p>
                    <p className="text-gray-400 mt-2">Click "Create New Slot" to add your first event</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                        <div key={date} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{date}</h2>
                            <div className="space-y-4">
                                {dateEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {event.title}
                                                </h3>
                                                {event.description && (
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        {event.description}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                    <span>
                                                        🕒 {new Date(event.startTime).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        })} - {new Date(event.endTime).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                    <span>
                                                        👥 {event.bookedCount}/{event.capacity} booked
                                                    </span>
                                                </div>
                                                {event.bookings && event.bookings.length > 0 && (
                                                    <div className="mt-3 text-sm">
                                                        <p className="font-medium text-gray-700">Bookings:</p>
                                                        <ul className="mt-1 space-y-1">
                                                            {event.bookings.map((booking) => (
                                                                <li key={booking.id} className="text-gray-600">
                                                                    • {booking.user.name || booking.user.email} ({booking.status})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="ml-4 text-red-600 hover:text-red-700 font-medium text-sm"
                                            >
                                                Delete
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
    );
}
