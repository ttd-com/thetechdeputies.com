'use client';

import { getSetting } from '@/lib/db';

export default function SessionsPage() {
    // In production, this would fetch the Acuity user ID from settings
    // For now, display placeholder content
    const acuityConfigured = false;

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

            {acuityConfigured ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Acuity embed would go here */}
                    <iframe
                        src="https://app.acuityscheduling.com/schedule.php?owner=YOUR_OWNER_ID&appointmentType=category:Appointments"
                        className="w-full min-h-[600px] border-0"
                        title="Manage your appointments"
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
                        No Sessions Yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        You don&apos;t have any scheduled sessions. Book your first tech support session to get started!
                    </p>
                    <a
                        href="/booking"
                        className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Book a Session
                    </a>
                </div>
            )}
        </div>
    );
}
