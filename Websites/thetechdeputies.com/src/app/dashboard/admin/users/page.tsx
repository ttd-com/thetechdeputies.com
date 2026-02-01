'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
    emailVerified: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function loadUsers() {
            try {
                const response = await fetch('/api/admin/users');
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users || []);
                }
            } catch (error) {
                console.error('Failed to load users:', error);
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    const handleVerifyEmail = async (userId: number, userEmail: string) => {
        if (!confirm(`Manually verify email for ${userEmail}?`)) return;

        setVerifyingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/verify-email`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Email verified successfully!');
                // Reload users to reflect changes
                const refreshResponse = await fetch('/api/admin/users');
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setUsers(data.users || []);
                }
            } else {
                const data = await response.json();
                alert(`Failed to verify email: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to verify email:', error);
            alert('Failed to verify email');
        } finally {
            setVerifyingUserId(null);
        }
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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    User Management
                </h1>
                <p className="text-gray-600">
                    View and manage user accounts.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p>No users yet</p>
                        <p className="text-sm">Users will appear here once they register.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Email Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
                                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--color-secondary)]">
                                                        {user.name || 'No name'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${(user.role as string) === 'ADMIN'
                                                        ? 'bg-[var(--color-accent-terracotta)]/10 text-[var(--color-accent-terracotta)]'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }
                        `}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.emailVerified ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleVerifyEmail(user.id, user.email)}
                                                    disabled={verifyingUserId === user.id}
                                                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    {verifyingUserId === user.id ? 'Verifying...' : 'Not Verified'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                                                className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-sm font-medium"
                                            >
                                                View
                                            </button>
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
