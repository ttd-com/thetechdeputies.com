'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        async function verifyEmail() {
            try {
                const response = await fetch(`/api/auth/verify?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch {
                setStatus('error');
                setMessage('An error occurred during verification');
            }
        }

        verifyEmail();
    }, [token]);

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
            {status === 'loading' && (
                <>
                    <div className="mb-6">
                        <svg className="animate-spin h-16 w-16 mx-auto text-[var(--color-primary)]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                        Verifying your email...
                    </h1>
                    <p className="text-gray-600 mt-2">Please wait a moment.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                        Email Verified! 🎉
                    </h1>
                    <p className="text-gray-600 mt-2 mb-6">{message}</p>
                    <Link
                        href="/login"
                        className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-8 rounded-lg transition-all"
                    >
                        Sign In Now
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                        Verification Failed
                    </h1>
                    <p className="text-gray-600 mt-2 mb-6">{message}</p>
                    <div className="space-x-4">
                        <Link
                            href="/register"
                            className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                        >
                            Create New Account
                        </Link>
                        <Link
                            href="/login"
                            className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] px-4">
            <div className="w-full max-w-md">
                <Suspense fallback={
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
                        <svg className="animate-spin h-16 w-16 mx-auto text-[var(--color-primary)]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-gray-600 mt-4">Loading...</p>
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </main>
    );
}
