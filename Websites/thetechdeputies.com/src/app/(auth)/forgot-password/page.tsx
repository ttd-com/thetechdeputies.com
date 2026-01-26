'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.status === 429) {
                setStatus('error');
                setMessage('Too many reset attempts. Please try again in an hour.');
                return;
            }

            // Always show success message to prevent email enumeration
            setStatus('success');
            setMessage(data.message || 'If an account exists with this email, you will receive a password reset link.');
        } catch {
            setStatus('error');
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                            Reset Password
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center">
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-lg mb-6">
                                <svg
                                    className="w-12 h-12 mx-auto mb-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="font-medium">{message}</p>
                            </div>
                            <Link
                                href="/login"
                                className="text-[var(--color-primary)] font-semibold hover:underline"
                            >
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {status === 'error' && (
                                <div
                                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/login"
                                    className="text-[var(--color-primary)] font-semibold hover:underline"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
