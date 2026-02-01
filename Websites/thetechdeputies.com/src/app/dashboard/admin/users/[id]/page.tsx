'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    name: string | null;
    role: 'USER' | 'ADMIN';
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        params.then(p => setUserId(p.id));
    }, [params]);

    useEffect(() => {
        if (!userId) return;

        async function loadUser() {
            try {
                const response = await fetch(`/api/admin/users/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else if (response.status === 404) {
                    alert('User not found');
                    router.push('/dashboard/admin/users');
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, [userId, router]);

    const handleResetPassword = async () => {
        if (!user || !confirm(`Send password reset email to ${user.email}?`)) return;

        setResetting(true);
        try {
            const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Password reset email sent successfully!');
            } else {
                const data = await response.json();
                alert(`Failed to reset password: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert('Failed to reset password');
        } finally {
            setResetting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!user || !confirm(`Are you sure you want to delete ${user.email}? This action can be undone.`)) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('User deleted successfully');
                router.push('/dashboard/admin/users');
            } else {
                const data = await response.json();
                alert(`Failed to delete user: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        } finally {
            setDeleting(false);
        }
    };

    const handleRestoreUser = async () => {
        if (!user || !confirm(`Restore ${user.email}?`)) return;

        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restore' }),
            });

            if (response.ok) {
                alert('User restored successfully');
                // Reload user data
                const refreshResponse = await fetch(`/api/admin/users/${user.id}`);
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setUser(data.user);
                }
            } else {
                const data = await response.json();
                alert(`Failed to restore user: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to restore user:', error);
            alert('Failed to restore user');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">User not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/dashboard/admin/users')}
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-sm font-medium mb-4 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Users
                </button>
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    User Details
                </h1>
            </div>

            {user.deletedAt && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">⚠️ This user has been deleted</p>
                    <p className="text-red-600 text-sm">Deleted on: {formatDate(user.deletedAt)}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* User Header */}
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] font-bold text-2xl">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{user.name || 'No name'}</h2>
                            <p className="text-white/80">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                            <p className="text-[var(--color-secondary)] font-medium">{user.id}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                            <span
                                className={`
                                    inline-flex px-3 py-1 text-sm font-semibold rounded-full
                                    ${user.role === 'ADMIN'
                                        ? 'bg-[var(--color-accent-terracotta)]/10 text-[var(--color-accent-terracotta)]'
                                        : 'bg-gray-100 text-gray-600'
                                    }
                                `}
                            >
                                {user.role}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Verified</label>
                            <p className="text-[var(--color-secondary)] font-medium">
                                {user.emailVerified ? '✓ Yes' : '✗ No'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                            <p className="text-[var(--color-secondary)] font-medium">
                                {user.deletedAt ? 'Deleted' : 'Active'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Joined</label>
                            <p className="text-[var(--color-secondary)]">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                            <p className="text-[var(--color-secondary)]">{formatDate(user.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">Actions</h3>
                        <div className="flex gap-3">
                            {!user.deletedAt ? (
                                <>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={resetting}
                                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resetting ? 'Sending...' : 'Reset Password'}
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        disabled={deleting}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete User'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleRestoreUser}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Restore User
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
