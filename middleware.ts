import { authMiddleware } from '@/lib/auth.config';

// Next.js requires a function named `middleware` to be exported.
// Delegate to the NextAuth-provided `authMiddleware` for Edge runtime compatibility.
export async function middleware(request: Request) {
    // authMiddleware expects the NextRequest/Request shape used by NextAuth
    // Return its result directly.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - NextAuth middleware type is compatible at runtime
    return await authMiddleware(request as any);
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
