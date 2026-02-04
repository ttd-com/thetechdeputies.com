'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/atoms';
import Link from 'next/link';

interface Plan {
  id: number;
  displayName: string;
  description: string;
  priceInCents: number;
  tier: string;
}

interface Subscription {
  id: number;
  userId: number;
  planId: number;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  sessionBookedThisMonth: number;
  plan: Plan & { sessionLimit: number };
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await fetch('/api/subscriptions');
                if (!response.ok) throw new Error('Failed to fetch subscriptions');
                const data = await response.json();
                setSubscriptions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary">
                        My Subscriptions
                    </h1>
                </div>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary">
                    My Subscriptions
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your recurring tech support plans.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            )}

            {subscriptions.length > 0 ? (
                <div className="space-y-6">
                    {subscriptions.map((subscription) => (
                        <Card key={subscription.id} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                {/* Plan Info */}
                                <div>
                                    <h3 className="text-xl font-bold text-secondary mb-2">
                                        {subscription.plan.displayName}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {subscription.plan.description}
                                    </p>
                                    <div className="text-2xl font-bold text-primary">
                                        ${(subscription.plan.priceInCents / 100).toFixed(2)}
                                        <span className="text-sm text-muted-foreground font-normal">/month</span>
                                    </div>
                                </div>

                                {/* Billing & Session Info */}
                                <div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                                            <p className="capitalize font-semibold mt-1">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    {subscription.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Current Period</p>
                                            <p className="text-sm mt-1">
                                                {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Sessions This Month</p>
                                            <p className="text-sm mt-1 font-semibold">
                                                {subscription.sessionBookedThisMonth} / {subscription.plan.sessionLimit === 0 ? '∞ Unlimited' : subscription.plan.sessionLimit}
                                            </p>
                                            {subscription.plan.sessionLimit > 0 && (
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.min((subscription.sessionBookedThisMonth / subscription.plan.sessionLimit) * 100, 100)}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                        {subscription.stripeSubscriptionId && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">Stripe ID</p>
                                                <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                                                    {subscription.stripeSubscriptionId}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-semibold">
                                        Manage Plan
                                    </button>
                                    <button className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
                                        Cancel Subscription
                                    </button>
                                    <Link href="/subscriptions" className="block">
                                        <button className="w-full px-4 py-2 text-primary text-center rounded-lg hover:bg-primary/5 transition-colors">
                                            View Other Plans
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-secondary mb-2">
                        No Active Subscriptions
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Subscribe to one of our tech support plans for ongoing assistance and exclusive benefits.
                    </p>
                    <Link href="/subscriptions">
                        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            View Subscription Plans
                        </button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
