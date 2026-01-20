import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Middleware must use authConfig (Edge Runtime compatible)
// Cannot use full auth() which includes database operations
export default NextAuth(authConfig);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register',
    ],
};
