import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent, getAllUsers } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/internal/create-calendar-slots
 * Create demo/test calendar time slots for booking (development only)
 * 
 * This endpoint is restricted to localhost to ensure it's not accidentally exposed
 */

export async function POST(req: NextRequest) {
  try {
    // Only allow on localhost
    const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
    
    if (!isLocalhost) {
      logger.warn('Unauthorized access attempt to /api/internal/create-calendar-slots from ' + req.nextUrl.hostname);
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const body = await req.json();

    // Get all users to find an admin
    const users = await getAllUsers();
    let admin = users.find((u: any) => u.role === 'ADMIN' || u.role === 'admin');

    if (!admin && users.length > 0) {
      // If no admin exists but we have users, we can't easily promote one without direct DB access
      // For now, just return error - will need manual setup
      return NextResponse.json(
        { 
          error: 'No admin user found. Please promote a user to admin role first.',
          tip: 'Contact administrator to set role to "admin" for a user account.'
        },
        { status: 400 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'No users found in database' },
        { status: 400 }
      );
    }

    const slots = [];
    const now = new Date();

    // Create calendar slots across next 7 days
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      // Morning slot (10 AM)
      const morningStart = new Date(now);
      morningStart.setDate(morningStart.getDate() + dayOffset);
      morningStart.setHours(10, 0, 0, 0);
      
      const morningEnd = new Date(morningStart);
      morningEnd.setHours(11, 0, 0, 0);
      
      slots.push({
        title: `Morning Tech Support - ${new Date(morningStart).toLocaleDateString()}`,
        description: "30-minute or 1-hour tech support session. One-on-one guidance with patient, jargon-free explanations.",
        startTime: morningStart,
        endTime: morningEnd,
        capacity: 2,
        adminId: admin.id,
      });
      
      // Afternoon slot (2 PM)
      const afternoonStart = new Date(now);
      afternoonStart.setDate(afternoonStart.getDate() + dayOffset);
      afternoonStart.setHours(14, 0, 0, 0);
      
      const afternoonEnd = new Date(afternoonStart);
      afternoonEnd.setHours(15, 0, 0, 0);
      
      slots.push({
        title: `Afternoon Tech Support - ${new Date(afternoonStart).toLocaleDateString()}`,
        description: "30-minute or 1-hour tech support session. One-on-one guidance with patient, jargon-free explanations.",
        startTime: afternoonStart,
        endTime: afternoonEnd,
        capacity: 2,
        adminId: admin.id,
      });
      
      // Evening slot (6 PM)
      const eveningStart = new Date(now);
      eveningStart.setDate(eveningStart.getDate() + dayOffset);
      eveningStart.setHours(18, 0, 0, 0);
      
      const eveningEnd = new Date(eveningStart);
      eveningEnd.setHours(19, 0, 0, 0);
      
      slots.push({
        title: `Evening Tech Support - ${new Date(eveningStart).toLocaleDateString()}`,
        description: "30-minute or 1-hour tech support session. One-on-one guidance with patient, jargon-free explanations.",
        startTime: eveningStart,
        endTime: eveningEnd,
        capacity: 2,
        adminId: admin.id,
      });
    }

    // Create all slots
    const results = [];
    for (const slot of slots) {
      try {
        logger.info(`Attempting to create slot: ${slot.title} for admin ${admin.id}`);
        const event = await createCalendarEvent(slot);
        logger.info(`Successfully created event with ID: ${event.id}`);
        results.push({
          title: event.title,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          id: event.id,
          success: true,
        });
      } catch (error) {
        logger.error(`Failed to create slot: ${slot.title}`, error);
        results.push({
          title: slot.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json(
      {
        success: true,
        message: `Created ${successCount} calendar slots`,
        slots: results.filter(r => r.success),
        errors: results.filter(r => !r.success),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating calendar slots:', error);
    return NextResponse.json(
      {
        error: 'Failed to create calendar slots',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
