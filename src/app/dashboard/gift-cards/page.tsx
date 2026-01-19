'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GiftCard {
    id: number;
    code: string;
    original_amount: number;
    remaining_amount: number;
    purchaser_email: string;
    purchaser_name: string | null;
    recipient_email: string | null;
    recipient_name: string | null;
    status: 'active' | 'redeemed' | 'expired' | 'cancelled';
    purchased_at: string;
}

export default function GiftCardsPage() {
    const [giftCode, setGiftCode] = useState('');
    const [checkingBalance, setCheckingBalance] = useState(false);
    const [balanceResult, setBalanceResult] = useState<{ balance?: number; error?: string; status?: string; originalAmount?: number } | null>(null);

    const [myCards, setMyCards] = useState<{ purchased: GiftCard[]; received: GiftCard[] }>({ purchased: [], received: [] });
    const [loadingCards, setLoadingCards] = useState(true);

    useEffect(() => {
        async function fetchMyCards() {
            try {
                const response = await fetch('/api/gift-cards');
                if (response.ok) {
                    const data = await response.json();
                    setMyCards(data);
                }
            } catch (error) {
                console.error('Failed to fetch gift cards:', error);
            } finally {
                setLoadingCards(false);
            }
        }
        fetchMyCards();
    }, []);

    const handleCheckBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckingBalance(true);
        setBalanceResult(null);

        try {
            const response = await fetch('/api/gift-cards/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: giftCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                setBalanceResult({ error: data.error || 'Gift card not found' });
            } else {
                setBalanceResult(data);
            }
        } catch {
            setBalanceResult({ error: 'Failed to check balance' });
        } finally {
            setCheckingBalance(false);
        }
    };

    const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'redeemed': return 'bg-blue-100 text-blue-800';
            case 'expired': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                    Gift Cards
                </h1>
                <p className="text-gray-600 mt-2">
                    Check your balance or send tech support to a friend.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Check balance */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                        Check Gift Card Balance
                    </h2>
                    <form onSubmit={handleCheckBalance} className="space-y-4">
                        <div>
                            <label htmlFor="giftCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Gift Card Code
                            </label>
                            <input
                                id="giftCode"
                                type="text"
                                value={giftCode}
                                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!giftCode || checkingBalance}
                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checkingBalance ? 'Checking...' : 'Check Balance'}
                        </button>
                    </form>

                    {balanceResult && (
                        <div className={`mt-6 p-4 rounded-lg ${balanceResult.error ? 'bg-red-50' : 'bg-green-50'}`}>
                            {balanceResult.error ? (
                                <p className="text-red-700">{balanceResult.error}</p>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600">Current Balance</p>
                                    <p className="text-3xl font-bold text-[var(--color-primary)]">
                                        {formatCurrency(balanceResult.balance || 0)}
                                    </p>
                                    {balanceResult.originalAmount && balanceResult.balance !== balanceResult.originalAmount && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Original: {formatCurrency(balanceResult.originalAmount)}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Purchase gift card */}
                <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl shadow-lg p-6 text-white">
                    <h2 className="text-xl font-semibold mb-4">
                        Purchase a Gift Card
                    </h2>
                    <p className="text-white/80 mb-6">
                        Give the gift of tech support! Perfect for friends and family who could use a helping hand with technology.
                    </p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {['$25', '$50', '$100'].map((amount) => (
                                <Link
                                    key={amount}
                                    href="/gift-certificates"
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-lg font-semibold transition-colors text-center"
                                >
                                    {amount}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/gift-certificates"
                            className="block w-full bg-white text-[var(--color-primary)] font-semibold py-3 px-4 rounded-lg text-center hover:bg-gray-100 transition-colors"
                        >
                            View All Options
                        </Link>
                    </div>
                </div>
            </div>

            {/* My Gift Cards */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">
                    My Gift Cards
                </h2>

                {loadingCards ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : (myCards.purchased.length === 0 && myCards.received.length === 0) ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <p className="text-gray-600">You don&apos;t have any gift cards yet.</p>
                        <Link href="/gift-certificates" className="text-[var(--color-primary)] font-semibold hover:underline">
                            Purchase one now →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Received Cards */}
                        {myCards.received.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Received</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myCards.received.map((card) => (
                                        <div key={card.id} className="bg-white rounded-xl shadow p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(card.status)}`}>
                                                    {card.status}
                                                </span>
                                                <span className="text-2xl font-bold text-[var(--color-primary)]">
                                                    {formatCurrency(card.remaining_amount)}
                                                </span>
                                            </div>
                                            <p className="font-mono text-sm text-gray-600">{card.code}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                From: {card.purchaser_name || card.purchaser_email}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Purchased Cards */}
                        {myCards.purchased.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Purchased</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myCards.purchased.map((card) => (
                                        <div key={card.id} className="bg-white rounded-xl shadow p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(card.status)}`}>
                                                    {card.status}
                                                </span>
                                                <span className="text-2xl font-bold text-[var(--color-secondary)]">
                                                    {formatCurrency(card.original_amount)}
                                                </span>
                                            </div>
                                            <p className="font-mono text-sm text-gray-600">{card.code}</p>
                                            {card.recipient_email && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    To: {card.recipient_name || card.recipient_email}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Gift card features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                    title="Instant Delivery"
                    description="Gift cards are delivered instantly via email to you or directly to the recipient."
                />
                <FeatureCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    title="Never Expires"
                    description="Our gift cards never expire, so recipients can use them whenever they need support."
                />
                <FeatureCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    title="Easy to Use"
                    description="Simply enter the code at checkout to redeem for any of our tech support services."
                />
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center text-[var(--color-primary)] mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                {title}
            </h3>
            <p className="text-gray-600 text-sm">
                {description}
            </p>
        </div>
    );
}
