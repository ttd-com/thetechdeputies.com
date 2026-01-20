/**
 * @file route.ts
 * @description Admin endpoint for managing rate limits
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * DELETE /api/admin/rate-limits
 * Clear rate limit records by endpoint
 * 
 * Query params:
 * - endpoint: (optional) specific endpoint to clear (e.g., 'password-reset')
 * 
 * @example
 * // Clear all rate limits
 * DELETE /api/admin/rate-limits
 * 
 * @example
 * // Clear password-reset rate limits only
 * DELETE /api/admin/rate-limits?endpoint=password-reset
 */
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if ((session.user as any).role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const url = new URL(request.url);
        const endpoint = url.searchParams.get('endpoint');

        if (endpoint) {
            // Clear specific endpoint rate limits
            const result = await db.rateLimit.deleteMany({
                where: { endpoint },
            });

            logger.info('Cleared rate limits for specific endpoint', {
                endpoint,
                recordsDeleted: result.count,
            });

            return NextResponse.json({
                success: true,
                message: `Cleared ${result.count} rate limit records for endpoint: ${endpoint}`,
                recordsDeleted: result.count,
            });
        } else {
            // Clear all rate limits
            const result = await db.rateLimit.deleteMany({});

            logger.info('Cleared all rate limits', {
                recordsDeleted: result.count,
            });

            return NextResponse.json({
                success: true,
                message: `Cleared ${result.count} total rate limit records`,
                recordsDeleted: result.count,
            });
        }
    } catch (error) {
        logger.error('Error clearing rate limits', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
