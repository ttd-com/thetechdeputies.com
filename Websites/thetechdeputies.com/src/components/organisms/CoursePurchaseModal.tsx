'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CoursePurchaseModalProps {
    courseSlug: string;
    courseTitle: string;
    priceInCents: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CoursePurchaseModal({
    courseSlug,
    courseTitle,
    priceInCents,
    isOpen,
    onClose,
    onSuccess,
}: CoursePurchaseModalProps) {
    const { data: session } = useSession();
    const [giftCardCode, setGiftCardCode] = useState('');
    const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null);
    const [checkingCard, setCheckingCard] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

    const handleCheckGiftCard = async () => {
        if (!giftCardCode.trim()) return;

        setCheckingCard(true);
        setError(null);
        setGiftCardBalance(null);

        try {
            const response = await fetch('/api/gift-cards/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: giftCardCode }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || 'Gift card not found');
            } else if (data.balance !== undefined) {
                setGiftCardBalance(data.balance);
            }
        } catch {
            setError('Failed to check gift card');
        } finally {
            setCheckingCard(false);
        }
    };

    const handlePurchase = async () => {
        setPurchasing(true);
        setError(null);

        try {
            const response = await fetch('/api/courses/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseSlug,
                    giftCardCode: giftCardCode.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to purchase course');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } catch {
            setError('Failed to complete purchase');
        } finally {
            setPurchasing(false);
        }
    };

    const amountCoveredByGiftCard = giftCardBalance !== null
        ? Math.min(giftCardBalance, priceInCents)
        : 0;
    const remainingAmount = priceInCents - amountCoveredByGiftCard;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-6 text-white">
                    <h2 className="text-xl font-bold">Enroll in Course</h2>
                    <p className="text-white/80 text-sm mt-1">{courseTitle}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!session ? (
                        <div className="text-center py-4">
                            <p className="text-gray-600 mb-4">
                                Please sign in to purchase this course.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-2">
                                You&apos;re Enrolled!
                            </h3>
                            <p className="text-gray-600">
                                Redirecting to your courses...
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Price Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Course Price</span>
                                    <span className="font-semibold">{formatPrice(priceInCents)}</span>
                                </div>
                                {giftCardBalance !== null && (
                                    <>
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Gift Card Applied</span>
                                            <span>-{formatPrice(amountCoveredByGiftCard)}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="flex justify-between items-center font-bold">
                                            <span>Total Due</span>
                                            <span className="text-[var(--color-primary)]">
                                                {remainingAmount === 0 ? 'FREE' : formatPrice(remainingAmount)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Gift Card Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Have a gift card?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={giftCardCode}
                                        onChange={(e) => {
                                            setGiftCardCode(e.target.value.toUpperCase());
                                            setGiftCardBalance(null);
                                            setError(null);
                                        }}
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCheckGiftCard}
                                        disabled={!giftCardCode.trim() || checkingCard}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {checkingCard ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {giftCardBalance !== null && (
                                    <p className="text-sm text-green-600 mt-2">
                                        ✓ Gift card balance: {formatPrice(giftCardBalance)}
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Payment Note */}
                            {remainingAmount > 0 && giftCardBalance === null && (
                                <p className="text-xs text-gray-500 text-center">
                                    For demo purposes, purchases are simulated. In production, payment would be handled by Stripe.
                                </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="flex-1 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {purchasing ? 'Processing...' :
                                        remainingAmount === 0 && giftCardBalance !== null ? 'Enroll Now (Free)' :
                                            `Pay ${formatPrice(remainingAmount || priceInCents)}`
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
