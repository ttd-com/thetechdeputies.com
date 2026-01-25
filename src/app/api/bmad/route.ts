/**
 * BMad API Endpoint
 * 
 * Handles BMad command execution via HTTP API
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { BMadEngine } from '@/lib/bmad-interface';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const session = await auth();
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { command, parameters } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: "Command is required and must be a string" 
      }, { status: 400 });
    }

    // Check rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const rateLimitResult = await checkRateLimit(clientIp, 'bmad-command', 10, 60); // 10 commands per minute

    if (!rateLimitResult.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: "Rate limit exceeded" 
      }, { status: 429 });
    }

    // Execute BMad command
    const result = await BMadEngine.execute(command, session);

    // Log execution
    logger.info('BMad API command executed', {
      command,
      success: result.success,
      userId: session.user.id,
      executionTime: result.executionTime || Date.now() - startTime,
    });

    // Return response
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });

  } catch (error) {
    logger.error('BMad API endpoint failed', error as Error, { 
      body: await request.clone().text() 
    });

    return NextResponse.json({
      success: false,
      error: "Internal server error",
      bmadDetails: {
        phase: "api-execution",
        originalError: error instanceof Error ? error.message : 'Unknown error',
      },
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const session = await auth();
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    // Get help or stats based on query parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    let result: any;

    switch (action) {
      case 'help':
        result = {
          success: true,
          data: await BMadEngine.getHelp(),
          type: 'help'
        };
        break;
      
      case 'stats':
        // Only allow admins to view stats
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ 
            success: false, 
            error: "Forbidden" 
          }, { status: 403 });
        }

        result = {
          success: true,
          data: await BMadEngine.getStats(),
          type: 'stats'
        };
        break;
      
      case 'search':
        const query = searchParams.get('query');
        if (!query) {
          return NextResponse.json({ 
            success: false, 
            error: "Query parameter is required for search" 
          }, { status: 400 });
        }

        result = {
          success: true,
          data: await BMadEngine.search(query),
          type: 'search'
        };
        break;

      default:
        result = {
          success: true,
          data: {
            message: "BMad API endpoint is operational",
            actions: ["help", "stats", "search"],
            usage: {
              POST: { command: "string", parameters: "object" },
              GET: { action: "help|stats|search", query: "string (for search)" }
            }
          },
          type: 'info'
        };
    }

    // Log execution
    logger.info('BMad API GET request', {
      action,
      success: result.success,
      userId: session.user.id,
      executionTime: Date.now() - startTime,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    logger.error('BMad API GET endpoint failed', error as Error);

    return NextResponse.json({
      success: false,
      error: "Internal server error",
      bmadDetails: {
        phase: "api-get-execution",
        originalError: error instanceof Error ? error.message : 'Unknown error',
      },
    }, { status: 500 });
  }
}

/**
 * Check rate limiting using existing RateLimit model
 */
async function checkRateLimit(
  ipAddress: string,
  endpoint: string,
  maxRequests: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining?: number; resetTime?: Date }> {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    // Clean up old rate limit entries
    await db.rateLimit.deleteMany({
      where: {
        AND: [
          { endpoint },
          { windowStart: { lt: windowStart } }
        ]
      }
    });

    // Count requests in window
    const requestCount = await db.rateLimit.count({
      where: {
        AND: [
          { ipAddress },
          { endpoint },
          { windowStart: { gte: windowStart } }
        ]
      }
    });

    if (requestCount >= maxRequests) {
      return { allowed: false };
    }

    // Record this request
    await db.rateLimit.create({
      data: {
        ipAddress,
        endpoint,
        windowStart: new Date(),
      }
    });

    return { 
      allowed: true, 
      remaining: maxRequests - requestCount - 1 
    };

  } catch (error) {
    logger.error('Rate limiting check failed', error as Error, { ipAddress, endpoint });
    
    // Fail open - allow the request if rate limiting fails
    return { allowed: true };
  }
}