'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, redirect } from 'next/navigation';

interface AdminLayoutProps {
    children: ReactNode;
}

const adminNavItems = [
    { name: 'Overview', href: '/dashboard/admin' },
    { name: 'Users', href: '/dashboard/admin/users' },
    { name: 'System', href: '/dashboard/admin/system' },
    { name: 'Settings', href: '/dashboard/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    // Show loading state
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        );
    }

    // Check admin access (middleware also handles this)
    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div>
            {/* Admin header */}
            <div className="mb-6 p-4 bg-gradient-to-r from-[var(--color-accent-terracotta)] to-[var(--color-primary)] rounded-xl text-white">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                        <h2 className="text-xl font-bold">Deputy Command Center</h2>
                        <p className="text-white/80 text-sm">Administrator Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Admin navigation tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex gap-4 overflow-x-auto">
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${isActive
                                        ? 'border-[var(--color-accent-terracotta)] text-[var(--color-accent-terracotta)]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
