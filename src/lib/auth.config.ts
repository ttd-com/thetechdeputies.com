import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

// Auth configuration for Edge Runtime (middleware)
// Does not include database operations
export const authConfig: NextAuthConfig = {
    providers: [], // Providers configured in auth.ts
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdmin = (auth?.user as { role?: string })?.role === 'admin';
            const pathname = nextUrl.pathname;

            // Protected dashboard routes
            if (pathname.startsWith('/dashboard')) {
                if (!isLoggedIn) {
                    return false;
                }
                // Admin-only routes
                if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
                    return Response.redirect(new URL('/dashboard', nextUrl.origin));
                }
            }

            // Redirect logged-in users away from auth pages
            if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
                return Response.redirect(new URL('/dashboard', nextUrl.origin));
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = (user as { id: string }).id;
                token.role = (user as { role: string }).role;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                (session.user as { id?: string }).id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
    },
};

export const { auth: authMiddleware } = NextAuth(authConfig);
