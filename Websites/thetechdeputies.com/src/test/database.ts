import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

let prisma: PrismaClient
const TEST_DATABASE_URL = 'postgresql://test:test@localhost:5432/test_techdeputies'

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = TEST_DATABASE_URL
  
  // Initialize test database
  try {
    execSync('createdb test_techdeputies', { stdio: 'ignore' })
  } catch (error) {
    // Database might already exist
  }
  
  // Run migrations on test database
  execSync('npx prisma migrate deploy', { 
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit'
  })
  
  prisma = new PrismaClient()
})

beforeEach(async () => {
  // Clean up data before each test
  await prisma.user.deleteMany()
  await prisma.coursePurchase.deleteMany()
  await prisma.giftCard.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
})

afterAll(async () => {
  // Clean up test database
  await prisma.$disconnect()
  
  // Drop test database
  try {
    execSync('dropdb test_techdeputies', { stdio: 'ignore' })
  } catch (error) {
    // Database might not exist
  }
})

export { prisma }