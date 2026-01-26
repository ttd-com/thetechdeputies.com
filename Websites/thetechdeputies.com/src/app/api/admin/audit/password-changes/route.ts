import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const userId = searchParams.get('userId');
        const changeType = searchParams.get('changeType');

        const where: any = {};
        if (userId) {
            where.userId = parseInt(userId);
        }
        if (changeType) {
            where.changeType = changeType.toUpperCase();
        }

        const skip = (page - 1) * limit;

        const [auditLogs, total] = await Promise.all([
            (db as any).passwordChangeAudit.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    changedByUser: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            (db as any).passwordChangeAudit.count({ where }),
        ]);

        return NextResponse.json({
            auditLogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        logger.error('Failed to fetch password audit logs', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}