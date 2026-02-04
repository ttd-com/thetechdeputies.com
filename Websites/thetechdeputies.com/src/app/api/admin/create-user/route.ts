import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await db.user.upsert({
      where: { email },
      update: {
        role: 'admin' as any,
        emailVerified: true,
      },
      create: {
        email,
        name: name || 'Admin User',
        passwordHash: hashedPassword,
        role: 'admin' as any,
        emailVerified: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}
