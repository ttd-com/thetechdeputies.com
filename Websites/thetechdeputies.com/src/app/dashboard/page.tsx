'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: session } = useSession();

    const quickActions = [
        {
            title: 'Book a Session',
            description: 'Schedule your next tech support session',
            href: '/booking',
            icon: CalendarPlusIcon,
            color: 'bg-[var(--color-primary)]',
        },
        {
            title: 'View Courses',
            description: 'Explore our tech education catalog',
            href: '/courses',
            icon: BookIcon,
            color: 'bg-[var(--color-secondary)]',
        },
        {
            title: 'Gift a Session',
            description: 'Send tech support to a friend',
            href: '/gift-certificates',
            icon: GiftIcon,
            color: 'bg-[var(--color-accent-terracotta)]',
        },
    ];

    return (
        <div>
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                    Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here&apos;s what&apos;s happening with your Tech Deputies account.
                </p>
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="group relative overflow-hidden rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${action.color} opacity-10 rounded-bl-full transform group-hover:scale-150 transition-transform duration-500`} />
                        <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                            {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {action.description}
                        </p>
                        <div className="mt-4 text-[var(--color-primary)] text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Get started
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Upcoming Sessions"
                    value="0"
                    subtitle="No sessions scheduled"
                    icon={CalendarIcon}
                />
                <StatCard
                    title="Active Subscriptions"
                    value="0"
                    subtitle="View subscription options"
                    icon={CreditCardIcon}
                />
                <StatCard
                    title="Gift Card Balance"
                    value="$0.00"
                    subtitle="Purchase gift cards"
                    icon={GiftBalanceIcon}
                />
            </div>

            {/* Recent activity placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                    Recent Activity
                </h2>
                <div className="text-center py-12 text-gray-500">
                    <EmptyStateIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity to display.</p>
                    <p className="text-sm mt-1">Book a session to get started!</p>
                </div>
            </div>
        </div>
    );
}

// Stat card component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-[var(--color-secondary)] mt-1">{value}</p>
                    <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-400" />
                </div>
            </div>
        </div>
    );
}

// Icons
function CalendarPlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 11v6m3-3H9" />
        </svg>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );
}

function GiftIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
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

function GiftBalanceIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function EmptyStateIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    );
}
