'use client';

import { useEffect, useState } from 'react';

interface PasswordChangeAudit {
    id: number;
    userId: number;
    changedBy: number;
    changeType: 'SELF_CHANGE' | 'ADMIN_FORCE_CHANGE' | 'ADMIN_RESET';
    ipAddress: string | null;
    userAgent: string | null;
    success: boolean;
    errorMessage: string | null;
    createdAt: string;
    user: {
        id: number;
        email: string;
        name: string | null;
    };
    changedByUser: {
        id: number;
        email: string;
        name: string | null;
    };
}

export default function PasswordChangeAuditPage() {
    const [auditLogs, setAuditLogs] = useState<PasswordChangeAudit[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        userId: '',
        changeType: '',
    });

    useEffect(() => {
        loadAuditLogs();
    }, [page, filters]);

    async function loadAuditLogs() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(filters.userId && { userId: filters.userId }),
                ...(filters.changeType && { changeType: filters.changeType }),
            });

            const response = await fetch(`/api/admin/audit/password-changes?${params}`);
            if (response.ok) {
                const data = await response.json();
                setAuditLogs(data.auditLogs || []);
                setTotalPages(data.pagination?.pages || 1);
            }
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getChangeTypeColor = (type: string) => {
        switch (type) {
            case 'SELF_CHANGE':
                return 'bg-blue-100 text-blue-800';
            case 'ADMIN_FORCE_CHANGE':
                return 'bg-red-100 text-red-800';
            case 'ADMIN_RESET':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    Password Change Audit
                </h1>
                <p className="text-gray-600">
                    View all password change activities and audit logs.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                    Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                            User ID
                        </label>
                        <input
                            type="number"
                            value={filters.userId}
                            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="Enter user ID"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                            Change Type
                        </label>
                        <select
                            value={filters.changeType}
                            onChange={(e) => setFilters({ ...filters, changeType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                            <option value="">All Types</option>
                            <option value="SELF_CHANGE">Self Change</option>
                            <option value="ADMIN_FORCE_CHANGE">Admin Force Change</option>
                            <option value="ADMIN_RESET">Admin Reset</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ userId: '', changeType: '' })}
                            className="px-4 py-2 text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/10"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Changed By
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-[var(--color-secondary)]">
                                                    {log.user.name || 'No name'}
                                                </p>
                                                <p className="text-sm text-gray-500">{log.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-[var(--color-secondary)]">
                                                    {log.changedByUser.name || 'No name'}
                                                </p>
                                                <p className="text-sm text-gray-500">{log.changedByUser.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChangeTypeColor(log.changeType)}`}>
                                                {log.changeType.replace('_', ' ').toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                log.success 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {log.success ? 'Success' : 'Failed'}
                                            </span>
                                            {log.errorMessage && (
                                                <p className="text-xs text-red-600 mt-1">{log.errorMessage}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {log.ipAddress || 'Unknown'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <a 
                    href="/dashboard/admin/password-management"
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 text-sm font-medium"
                >
                    ← Back to Password Management
                </a>
            </div>
        </div>
    );
}