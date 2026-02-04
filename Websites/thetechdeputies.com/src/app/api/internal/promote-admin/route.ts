import { NextRequest, NextResponse } from 'next/server';
import { promoteUserToAdmin } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/internal/promote-admin
 * Promote a user to admin role (development only, localhost-restricted)
 */

export async function POST(req: NextRequest) {
  try {
    // Only allow on localhost
    const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
    
    if (!isLocalhost) {
      return NextResponse.json(
        { error: 'This endpoint is only available in development (localhost)' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const user = await promoteUserToAdmin(email);

    logger.info(`User ${email} promoted to admin`);

    return NextResponse.json(
      {
        success: true,
        message: `User ${email} promoted to admin`,
        user: { id: user.id, email: user.email, role: user.role },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error promoting user to admin:', error);
    return NextResponse.json(
      {
        error: 'Failed to promote user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

