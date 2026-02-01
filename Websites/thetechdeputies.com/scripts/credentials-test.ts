#!/usr/bin/env tsx
/**
 * Credential Test Script
 * Verifies all API keys and service connections are working
 * Run: npx tsx scripts/credentials-test.ts
 */

import { config } from 'dotenv';

// Load .env.local file explicitly
config({ path: ['.env.local', '.env'] });

interface TestResult {
  service: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Mailgun
async function testMailgun() {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    results.push({
      service: 'Mailgun',
      status: 'skipped',
      message: 'Missing MAILGUN_API_KEY or MAILGUN_DOMAIN',
    });
    return;
  }

  try {
    const auth = Buffer.from(`api:${apiKey}`).toString('base64');
    const response = await fetch(`https://api.mailgun.net/v3/domains/${domain}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        service: 'Mailgun',
        status: 'success',
        message: `Domain verified: ${domain}`,
        details: {
          domain: data.domain?.name,
          state: data.domain?.state,
        },
      });
    } else {
      const errorText = await response.text();
      results.push({
        service: 'Mailgun',
        status: 'error',
        message: `API request failed: ${response.status}`,
        details: errorText,
      });
    }
  } catch (error: any) {
    results.push({
      service: 'Mailgun',
      status: 'error',
      message: error.message,
    });
  }
}

// Test Acuity
async function testAcuity() {
  const userId = process.env.ACUITY_USER_ID;
  const apiKey = process.env.ACUITY_API_KEY;

  if (!userId || !apiKey) {
    results.push({
      service: 'Acuity Scheduling',
      status: 'skipped',
      message: 'Missing ACUITY_USER_ID or ACUITY_API_KEY',
    });
    return;
  }

  try {
    const auth = Buffer.from(`${userId}:${apiKey}`).toString('base64');
    const response = await fetch('https://acuityscheduling.com/api/v1/appointment-types', {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        service: 'Acuity Scheduling',
        status: 'success',
        message: `Connected successfully`,
        details: {
          appointmentTypes: data.length,
        },
      });
    } else {
      results.push({
        service: 'Acuity Scheduling',
        status: 'error',
        message: `API request failed: ${response.status}`,
      });
    }
  } catch (error: any) {
    results.push({
      service: 'Acuity Scheduling',
      status: 'error',
      message: error.message,
    });
  }
}

// Test Database
async function testDatabase() {
  try {
    // Import the pre-configured db instance
    const { db } = await import('../src/lib/db.js');
    
    await db.$connect();
    const userCount = await db.user.count();
    await db.$disconnect();

    const dbUrl = process.env.DATABASE_URL_REMOTE || process.env.DATABASE_URL || 'unknown';
    const host = dbUrl.includes('db.prisma.io') ? 'Prisma Cloud' : 
                 dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') ? 'Local' : 
                 'Custom';

    results.push({
      service: 'Database (PostgreSQL)',
      status: 'success',
      message: `Connection successful`,
      details: {
        users: userCount,
        host,
      },
    });
  } catch (error: any) {
    results.push({
      service: 'Database (PostgreSQL)',
      status: 'error',
      message: error.message,
    });
  }
}

// Test Redis
async function testRedis() {
  const redisUrl = process.env.REDIS_URL;
  const redisToken = process.env.REDIS_TOKEN;

  if (!redisUrl || !redisToken) {
    results.push({
      service: 'Redis (Upstash)',
      status: 'skipped',
      message: 'Missing REDIS_URL or REDIS_TOKEN',
    });
    return;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const testKey = `credential-test-${Date.now()}`;
    await redis.set(testKey, 'test', { ex: 10 });
    const value = await redis.get(testKey);
    await redis.del(testKey);

    results.push({
      service: 'Redis (Upstash)',
      status: 'success',
      message: `Connection successful`,
      details: {
        readWrite: value === 'test' ? 'OK' : 'Failed',
      },
    });
  } catch (error: any) {
    results.push({
      service: 'Redis (Upstash)',
      status: 'error',
      message: error.message,
    });
  }
}

// Test NextAuth Secret
function testNextAuth() {
  // Skipped - production handles this via platform env vars
  results.push({
    service: 'NextAuth',
    status: 'skipped',
    message: 'Skipped (production uses platform env vars)',
  });
}

// Main execution
async function main() {
  log('cyan', '\n🔍 Testing API Credentials...\n');

  // Run all tests
  await Promise.all([
    testMailgun(),
    testAcuity(),
    testDatabase(),
    testRedis(),
  ]);
  
  testNextAuth();

  // Print results
  log('cyan', '\n📊 Results:\n');

  let hasErrors = false;
  let hasSkipped = false;

  for (const result of results) {
    const symbol = result.status === 'success' ? '✓' : result.status === 'error' ? '✗' : '○';
    const color = result.status === 'success' ? 'green' : result.status === 'error' ? 'red' : 'yellow';

    log(color, `${symbol} ${result.service}: ${result.message}`);
    
    if (result.details) {
      console.log(`  ${JSON.stringify(result.details, null, 2).split('\n').join('\n  ')}`);
    }

    if (result.status === 'error') hasErrors = true;
    if (result.status === 'skipped') hasSkipped = true;
  }

  // Summary
  log('cyan', '\n' + '─'.repeat(50));
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  log('green', `✓ Success: ${successCount}`);
  if (errorCount > 0) log('red', `✗ Errors: ${errorCount}`);
  if (skippedCount > 0) log('yellow', `○ Skipped: ${skippedCount}`);

  if (hasErrors) {
    log('red', '\n⚠️  Some credentials are invalid or services are unreachable.');
    process.exit(1);
  } else if (hasSkipped) {
    log('yellow', '\n⚠️  Some credentials are not configured.');
    process.exit(0);
  } else {
    log('green', '\n✅ All configured credentials are valid!');
    process.exit(0);
  }
}

main().catch((error) => {
  log('red', `\n❌ Unexpected error: ${error.message}`);
  process.exit(1);
});
