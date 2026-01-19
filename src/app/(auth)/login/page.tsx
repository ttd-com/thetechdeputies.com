'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
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
                        aria-describedby="email-description"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                >
                    {loading ? (
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
                            Signing in...
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="text-[var(--color-primary)] font-semibold hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Sign in to your Tech Deputies account
                        </p>
                    </div>

                    <Suspense fallback={
                        <div className="flex justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
