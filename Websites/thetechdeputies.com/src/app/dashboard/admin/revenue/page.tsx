'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RevenueData {
    monthlyRecurringRevenue: number;
    currentMonthRevenue: number;
    activeSubscriptions: number;
}

interface Subscription {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
}

export default function RevenuePage() {
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [revenueRes, subsRes] = await Promise.all([
                    fetch('/api/admin/revenue'),
                    fetch('/api/admin/subscriptions'),
                ]);

                if (revenueRes.ok) {
                    const data = await revenueRes.json();
                    setRevenueData(data);
                }

                if (subsRes.ok) {
                    const data = await subsRes.json();
                    setSubscriptions(data.subscriptions || []);
                }
            } catch (error) {
                console.error('Failed to load revenue data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                        Revenue & Subscriptions
                    </h1>
                    <p className="text-gray-600">
                        Monitor subscription revenue and active subscriptions
                    </p>
                </div>
                <Link
                    href="/dashboard/admin"
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-sm font-medium"
                >
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-gray-500 text-sm font-medium">Monthly Recurring Revenue</p>
                    <p className="text-3xl font-bold text-[var(--color-secondary)] mt-1">
                        {loading ? '...' : formatCurrency(revenueData?.monthlyRecurringRevenue || 0)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Projected monthly income</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-gray-500 text-sm font-medium">Current Month Revenue</p>
                    <p className="text-3xl font-bold text-[var(--color-secondary)] mt-1">
                        {loading ? '...' : formatCurrency(revenueData?.currentMonthRevenue || 0)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Revenue this month</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-gray-500 text-sm font-medium">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-[var(--color-secondary)] mt-1">
                        {loading ? '...' : revenueData?.activeSubscriptions || 0}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Current subscribers</p>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-[var(--color-secondary)]">
                        Active Subscriptions
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p>No active subscriptions</p>
                        <p className="text-sm mt-1">Subscriptions will appear here once customers subscribe.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Current Period
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Started
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-[var(--color-secondary)]">
                                                    {sub.customerName}
                                                </p>
                                                <p className="text-sm text-gray-500">{sub.customerEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[var(--color-secondary)]">
                                                {formatCurrency(sub.amount)}
                                            </p>
                                            <p className="text-sm text-gray-500">per {sub.interval}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(sub.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
