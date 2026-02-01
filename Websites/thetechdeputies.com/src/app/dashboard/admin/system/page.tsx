'use client';

import { useEffect, useState } from 'react';

interface SystemStatus {
    mailgun: {
        configured: boolean;
        domain?: string;
    };
    stripe: {
        configured: boolean;
    };
    acuity: {
        configured: boolean;
    };
    database: {
        status: 'ok' | 'error';
        userCount: number;
    };
}

export default function AdminSystemPage() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStatus() {
            try {
                const response = await fetch('/api/admin/system');
                if (response.ok) {
                    const data = await response.json();
                    setStatus(data);
                }
            } catch (error) {
                console.error('Failed to load system status:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStatus();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    System Health
                </h1>
                <p className="text-gray-600">
                    Monitor integrations and system status.
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Database Status */}
                    <StatusCard
                        title="Database"
                        status={status?.database?.status === 'ok' ? 'healthy' : 'error'}
                        description={`SQLite • ${status?.database?.userCount || 0} users`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        }
                    />

                    {/* Mailgun Status */}
                    <StatusCard
                        title="Mailgun"
                        status={status?.mailgun?.configured ? 'healthy' : 'not_configured'}
                        description={status?.mailgun?.configured
                            ? `Domain: ${status.mailgun.domain}`
                            : 'Not configured'
                        }
                        actionLabel={status?.mailgun?.configured ? undefined : 'Configure'}
                        actionHref="/dashboard/admin/settings"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                    />

                    {/* Stripe Status */}
                    <StatusCard
                        title="Stripe"
                        status={status?.stripe?.configured ? 'healthy' : 'not_configured'}
                        description={status?.stripe?.configured
                            ? 'Live mode'
                            : 'Not configured'
                        }
                        actionLabel={status?.stripe?.configured ? undefined : 'Configure'}
                        actionHref="/dashboard/admin/settings"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10a1 1 0 011-1h16a1 1 0 011 1v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V8a2 2 0 012-2h14a2 2 0 012 2v2" />
                            </svg>
                        }
                    />

                    {/* Acuity Status */}
                    <StatusCard
                        title="Acuity Scheduling"
                        status={status?.acuity?.configured ? 'healthy' : 'not_configured'}
                        description={status?.acuity?.configured
                            ? 'Legacy (not used)'
                            : 'Not configured'
                        }
                        actionLabel={status?.acuity?.configured ? undefined : 'Configure'}
                        actionHref="/dashboard/admin/settings"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                </div>
            )}

            {/* System info */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                    System Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Platform" value="The Tech Deputies" />
                    <InfoRow label="Framework" value="Next.js 16" />
                    <InfoRow label="Database" value="SQLite" />
                    <InfoRow label="Authentication" value="NextAuth.js v5" />
                </div>
            </div>
        </div>
    );
}

function StatusCard({
    title,
    status,
    description,
    icon,
    actionLabel,
    actionHref,
}: {
    title: string;
    status: 'healthy' | 'error' | 'not_configured';
    description: string;
    icon: React.ReactNode;
    actionLabel?: string;
    actionHref?: string;
}) {
    const statusColors = {
        healthy: 'bg-green-100 text-green-600',
        error: 'bg-red-100 text-red-600',
        not_configured: 'bg-yellow-100 text-yellow-600',
    };

    const statusLabels = {
        healthy: 'Healthy',
        error: 'Error',
        not_configured: 'Not Configured',
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    {icon}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
                    {statusLabels[status]}
                </span>
            </div>
            <h3 className="font-semibold text-[var(--color-secondary)]">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            {actionLabel && actionHref && (
                <a
                    href={actionHref}
                    className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--color-primary)] font-medium hover:underline"
                >
                    {actionLabel}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-[var(--color-secondary)]">{value}</span>
        </div>
    );
}
