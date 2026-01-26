'use client';

import { useEffect, useState } from 'react';

interface Stats {
    totalUsers: number;
    adminUsers: number;
    recentUsers: number;
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    Overview
                </h1>
                <p className="text-gray-600">
                    Monitor your Tech Deputies platform at a glance.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={loading ? '...' : (stats?.totalUsers || 0).toString()}
                    change="+0% from last month"
                    icon={UsersIcon}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$0.00"
                    change="Configure Acuity to sync"
                    icon={DollarIcon}
                    color="bg-green-500"
                />
                <StatCard
                    title="Sessions Booked"
                    value="0"
                    change="This month"
                    icon={CalendarIcon}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Active Subscriptions"
                    value="0"
                    change="Configure Acuity to sync"
                    icon={CreditCardIcon}
                    color="bg-orange-500"
                />
            </div>

            {/* Quick actions and recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <QuickAction
                            href="/dashboard/admin/settings"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                            title="Configure API Keys"
                            description="Set up Mailgun and Acuity integration"
                        />
                        <QuickAction
                            href="/dashboard/admin/users"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            }
                            title="Manage Users"
                            description="View and manage user accounts"
                        />
                        <QuickAction
                            href="/dashboard/admin/system"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                            title="System Health"
                            description="Check API status and integrations"
                        />
                    </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                        Recent Activity
                    </h2>
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No recent activity</p>
                        <p className="text-sm">Activity will appear here once users start interacting with your platform.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Components
function StatCard({
    title,
    value,
    change,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-[var(--color-secondary)] mt-1">{value}</p>
                    <p className="text-gray-400 text-xs mt-2">{change}</p>
                </div>
                <div className={`p-3 ${color} rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

function QuickAction({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <a
            href={href}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-gray-50 transition-colors"
        >
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                {icon}
            </div>
            <div>
                <p className="font-medium text-[var(--color-secondary)]">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </a>
    );
}

// Icons
function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function DollarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function CreditCardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}
