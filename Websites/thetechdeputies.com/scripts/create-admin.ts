#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST, before any other imports
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '../src/lib/db';
import * as bcrypt from 'bcryptjs';

async function main() {
  const email = process.argv[2] || 'r.foraker@thetechdeputies.com';
  const password = process.argv[3] || 'asdqwe12';
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await db.user.upsert({
    where: { email },
    update: { 
      role: 'admin', 
      emailVerified: new Date() 
    },
    create: {
      email,
      name: 'Ryan Foraker',
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date()
    }
  });
  
  console.log('Admin user created/updated:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
