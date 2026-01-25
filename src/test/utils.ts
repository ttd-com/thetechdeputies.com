import { prisma } from './database'

export { prisma }
import { hash } from 'bcryptjs'
import type { Role, GiftCardStatus, CoursePurchaseStatus } from '@prisma/client'

// Test user factory
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    passwordHash: await hash('password123', 10),
    role: 'USER' as Role,
    emailVerified: true,
    ...overrides
  }

  return await prisma.user.create({ data: defaultUser })
}

// Test admin user factory
export const createTestAdmin = async (overrides = {}) => {
  return await createTestUser({
    email: 'admin@example.com',
    role: 'ADMIN',
    ...overrides
  })
}

// Test course purchase factory
export const createTestCoursePurchase = async (userId: number, overrides = {}) => {
  const defaultPurchase = {
    courseSlug: 'test-course',
    amountPaid: 9999, // $99.99 in cents
    status: 'ACTIVE' as CoursePurchaseStatus,
    ...overrides
  }

  return await prisma.coursePurchase.create({ 
    data: {
      ...defaultPurchase,
      user: { connect: { id: userId } }
    }
  })
}

// Test gift card factory
export const createTestGiftCard = async (overrides = {}) => {
  const defaultGiftCard = {
    code: 'TEST123',
    originalAmount: 5000, // $50.00 in cents
    remainingAmount: 5000,
    purchaserEmail: 'test@example.com',
    status: 'ACTIVE' as GiftCardStatus,
    ...overrides
  }

  return await prisma.giftCard.create({ data: defaultGiftCard })
}

// Clean up all test data
export const cleanupTestData = async () => {
  await prisma.coursePurchase.deleteMany()
  await prisma.giftCard.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
  await prisma.user.deleteMany()
}

// Create mock session
export const createMockSession = (user: any) => ({
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
})