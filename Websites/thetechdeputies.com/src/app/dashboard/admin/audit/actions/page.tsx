'use client';

import { useEffect, useState } from 'react';

interface AdminActionAudit {
    id: number;
    adminId: number;
    action: string;
    targetUserId: number | null;
    targetEmail: string | null;
    details: any;
    ipAddress: string | null;
    userAgent: string | null;
    success: boolean;
    errorMessage: string | null;
    createdAt: string;
    admin: {
        id: number;
        email: string;
        name: string | null;
    };
}

export default function AdminActionAuditPage() {
    const [auditLogs, setAuditLogs] = useState<AdminActionAudit[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        adminId: '',
        action: '',
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
                ...(filters.adminId && { adminId: filters.adminId }),
                ...(filters.action && { action: filters.action }),
            });

            const response = await fetch(`/api/admin/audit/actions?${params}`);
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

    const getActionColor = (action: string) => {
        switch (action) {
            case 'PASSWORD_RESET':
                return 'bg-orange-100 text-orange-800';
            case 'PASSWORD_RESET_REQUEST':
                return 'bg-blue-100 text-blue-800';
            case 'FORCE_PASSWORD_CHANGE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDetails = (details: any) => {
        if (!details) return null;
        try {
            return JSON.stringify(details, null, 2);
        } catch {
            return String(details);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    Admin Action Audit
                </h1>
                <p className="text-gray-600">
                    View all administrative actions and system changes.
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
                            Admin ID
                        </label>
                        <input
                            type="number"
                            value={filters.adminId}
                            onChange={(e) => setFilters({ ...filters, adminId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="Enter admin ID"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                            Action
                        </label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                            <option value="">All Actions</option>
                            <option value="PASSWORD_RESET">Password Reset</option>
                            <option value="PASSWORD_RESET_REQUEST">Password Reset Request</option>
                            <option value="FORCE_PASSWORD_CHANGE">Force Password Change</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ adminId: '', action: '' })}
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
                                        Admin
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Target
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
                                                    {log.admin.name || 'No name'}
                                                </p>
                                                <p className="text-sm text-gray-500">{log.admin.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                                {log.action.replace('_', ' ').toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.targetEmail ? (
                                                <div>
                                                    <p className="font-medium text-[var(--color-secondary)]">
                                                        {log.targetEmail}
                                                    </p>
                                                    {log.details && (
                                                        <button
                                                            onClick={() => alert(formatDetails(log.details))}
                                                            className="text-xs text-[var(--color-primary)] hover:underline"
                                                        >
                                                            View Details
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">System</span>
                                            )}
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