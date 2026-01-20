'use client';

import { useEffect, useState } from 'react';

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

interface Stats {
    total: number;
    active: number;
    redeemed: number;
    totalValue: number;
    redeemedValue: number;
}

export default function AdminGiftCardsPage() {
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'redeemed' | 'cancelled'>('all');

    // Create form state
    const [newCard, setNewCard] = useState({
        amount: '',
        recipientEmail: '',
        recipientName: '',
        message: '',
    });

    const fetchGiftCards = async () => {
        try {
            const response = await fetch('/api/admin/gift-cards');
            if (response.ok) {
                const data = await response.json();
                setGiftCards(data.giftCards);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch gift cards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGiftCards();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const response = await fetch('/api/admin/gift-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amountCents: Math.round(parseFloat(newCard.amount) * 100),
                    recipientEmail: newCard.recipientEmail || undefined,
                    recipientName: newCard.recipientName || undefined,
                    message: newCard.message || undefined,
                }),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewCard({ amount: '', recipientEmail: '', recipientName: '', message: '' });
                fetchGiftCards();
            }
        } catch (error) {
            console.error('Failed to create gift card:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await fetch('/api/admin/gift-cards', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            fetchGiftCards();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

    const filteredCards = giftCards.filter(card =>
        filter === 'all' || card.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'redeemed': return 'bg-blue-100 text-blue-800';
            case 'expired': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                        Gift Cards
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage gift cards and track redemptions.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    + Create Gift Card
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <p className="text-sm text-gray-600">Total Cards</p>
                        <p className="text-3xl font-bold text-[var(--color-secondary)]">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <p className="text-sm text-gray-600">Active</p>
                        <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-3xl font-bold text-[var(--color-primary)]">{formatCurrency(stats.totalValue || 0)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <p className="text-sm text-gray-600">Redeemed</p>
                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.redeemedValue || 0)}</p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="mb-6 flex gap-2">
                {(['all', 'active', 'redeemed', 'cancelled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Gift Cards Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchaser</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredCards.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No gift cards found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredCards.map((card) => (
                                <tr key={card.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{card.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(card.originalAmount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatCurrency(card.remainingAmount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{card.purchaserEmail}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{card.recipientEmail || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(card.status)}`}>
                                            {card.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {card.status === 'active' && (
                                            <button
                                                onClick={() => handleStatusChange(card.id, 'cancelled')}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold text-[var(--color-secondary)] mb-4">
                            Create Gift Card
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newCard.amount}
                                    onChange={(e) => setNewCard({ ...newCard, amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    placeholder="50.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Email (optional)
                                </label>
                                <input
                                    type="email"
                                    value={newCard.recipientEmail}
                                    onChange={(e) => setNewCard({ ...newCard, recipientEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    placeholder="recipient@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Name (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newCard.recipientName}
                                    onChange={(e) => setNewCard({ ...newCard, recipientName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message (optional)
                                </label>
                                <textarea
                                    value={newCard.message}
                                    onChange={(e) => setNewCard({ ...newCard, message: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    rows={3}
                                    placeholder="Happy Birthday!"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
