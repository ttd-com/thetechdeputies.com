'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

interface User {
    id: number;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
    created_at: string;
}

interface PasswordResetRequest {
    id: number;
    email: string;
    name: string | null;
    resetToken?: string;
}

export default function AdminPasswordManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [action, setAction] = useState<'reset' | 'force-change' | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [resetReason, setResetReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handlePasswordAction = async () => {
        if (!selectedUser || !action) return;

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/password-management', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    userId: selectedUser.id,
                    newPassword,
                    forceChangeOnNextLogin: action === 'reset',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
                setSelectedUser(null);
                setAction(null);
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Operation failed' });
            }
        } catch (error) {
            console.error('Password action failed:', error);
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordResetRequest = async () => {
        if (!resetEmail) {
            setMessage({ type: 'error', text: 'Email is required' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail,
                    reason: resetReason,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: `Password reset token generated for ${data.user.email}. Token: ${data.resetToken}` 
                });
                setResetEmail('');
                setResetReason('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Reset request failed' });
            }
        } catch (error) {
            console.error('Password reset request failed:', error);
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    Password Management
                </h1>
                <p className="text-gray-600">
                    Manage user passwords and view audit logs.
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User List */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                        Users
                    </h2>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {users.map((user) => (
                                <div 
                                    key={user.id} 
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        selectedUser?.id === user.id 
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold">
                                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--color-secondary)]">
                                                {user.name || 'No name'}
                                            </p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'admin'
                                                ? 'bg-[var(--color-accent-terracotta)]/10 text-[var(--color-accent-terracotta)]'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Password Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                        Password Actions
                    </h2>

                    {selectedUser ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-[var(--color-secondary)]">
                                    {selectedUser.name || 'No name'}
                                </p>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                    Action Type
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="action"
                                            value="reset"
                                            checked={action === 'reset'}
                                            onChange={(e) => setAction(e.target.value as any)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Reset Password (user sets new password)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="action"
                                            value="force-change"
                                            checked={action === 'force-change'}
                                            onChange={(e) => setAction(e.target.value as any)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Force Change Password</span>
                                    </label>
                                </div>
                            </div>

                            {action && (
                                <>
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handlePasswordAction}
                                            isLoading={isLoading}
                                            disabled={!action || !newPassword || !confirmPassword}
                                            className="flex-1"
                                        >
                                            {action === 'reset' ? 'Reset Password' : 'Force Change'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedUser(null);
                                                setAction(null);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            Select a user to manage their password
                        </p>
                    )}
                </div>
            </div>

            {/* Password Reset Request Section */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                    Generate Password Reset Link
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="User Email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                    />
                    <Input
                        label="Reason (Optional)"
                        type="text"
                        value={resetReason}
                        onChange={(e) => setResetReason(e.target.value)}
                        placeholder="Reason for password reset"
                    />
                </div>

                <Button
                    onClick={handlePasswordResetRequest}
                    isLoading={isLoading}
                    disabled={!resetEmail}
                    className="mt-4"
                >
                    Generate Reset Token
                </Button>
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex gap-4">
                <a 
                    href="/dashboard/admin/audit/password-changes"
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-sm font-medium"
                >
                    View Password Change Audit →
                </a>
                <a 
                    href="/dashboard/admin/audit/actions"
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-sm font-medium"
                >
                    View Admin Action Audit →
                </a>
            </div>
        </div>
    );
}