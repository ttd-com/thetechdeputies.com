import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';
import { authConfig } from './auth.config';

export type UserRole = 'user' | 'admin';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string | null;
            role: UserRole;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string | null;
        role: UserRole;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = getUserByEmail(email);
                if (!user) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
});
