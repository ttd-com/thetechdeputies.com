'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function DashboardSettingsPage() {
    const { data: session } = useSession();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">Account Settings</h1>
                <p className="text-gray-600">Manage your account and security settings.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg">
                <h2 className="text-lg font-semibold mb-4">Signed in as</h2>
                <p className="text-sm text-gray-700 mb-1">{session?.user?.name || session?.user?.email}</p>
                <p className="text-xs text-gray-500 mb-4">Role: {(session?.user as any)?.role || 'USER'}</p>

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded-lg"
                    >
                        Sign Out
                    </button>

                    <form onSubmit={handleChangePassword} className="space-y-3">
                        <h3 className="text-sm font-medium">Change Password</h3>
                        {message && (
                            <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-gray-600">Current password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">New password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Confirm new password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white py-2 px-4 rounded disabled:opacity-50">
                                {loading ? 'Saving...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
