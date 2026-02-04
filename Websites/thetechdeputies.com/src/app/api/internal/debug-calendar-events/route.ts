import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * GET /api/internal/debug-calendar-events
 * Debug endpoint to check calendar events in database
 */

export async function GET(req: NextRequest) {
  try {
    // Only allow on localhost
    const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
    
    if (!isLocalhost) {
      return NextResponse.json(
        { error: 'This endpoint is only available in development (localhost)' },
        { status: 403 }
      );
    }

    // Get all events without date filtering
    const events = await getCalendarEvents();

    logger.info(`Found ${events.length} calendar events in database`);

    return NextResponse.json(
      {
        total: events.length,
        events: events.map(e => ({
          id: e.id,
          title: e.title,
          startTime: e.startTime.toISOString(),
          endTime: e.endTime.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error fetching calendar events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
