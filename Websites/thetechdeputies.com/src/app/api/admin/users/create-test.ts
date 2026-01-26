import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type Role = 'USER' | 'ADMIN';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create a test user for demonstration
    const testUser = await db.user.create({
      data: {
        email: 'testuser@thetechdeputies.com',
        name: 'Test User',
        passwordHash: 'temp-hash-for-demo-only',
        role: 'USER' as any,
        emailVerified: true,
      }
    });

    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role
      }
    });
  } catch (error) {
    console.error('Failed to create test user:', error);
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 });
  }
}