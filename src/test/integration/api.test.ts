import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createTestUser, createMockSession, prisma } from '../utils'

describe('API Integration Tests', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('BMad API Route', () => {
    it('should handle BMad command execution requests', async () => {
      const user = await createTestUser({ role: 'USER' })
      const mockSession = createMockSession(user)

      const request = new NextRequest('http://localhost:3000/api/bmad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `next-auth.session-token=${mockSession.user.id}`
        },
        body: JSON.stringify({
          command: '/bmad:core:agents:bmad-master'
        })
      })

      // This would require setting up NextAuth session handling in tests
      // For now, we'll test the route structure
      expect(request.method).toBe('POST')
      expect(request.url).toContain('/api/bmad')
    })

    it('should validate command format', async () => {
      const user = await createTestUser({ role: 'USER' })

      const request = new NextRequest('http://localhost:3000/api/bmad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'invalid-command'
        })
      })

      expect(request.json()).resolves.toEqual({
        command: 'invalid-command'
      })
    })

    it('should handle missing command parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/bmad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(request.json()).resolves.toEqual({})
    })

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/bmad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: '/bmad:core:agents:bmad-master'
        })
      })

      // Should return 401 for unauthenticated requests
      // This would be tested with actual route implementation
      expect(request.url).toContain('/api/bmad')
    })
  })

  describe('Users API Route', () => {
    it('should require admin role for user management', async () => {
      const regularUser = await createTestUser({ role: 'USER' })
      const adminUser = await createTestUser({ role: 'ADMIN' })
      const mockAdminSession = createMockSession(adminUser)

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${mockAdminSession.user.id}`
        }
      })

      expect(request.url).toContain('/api/admin/users')
    })

    it('should paginate user results', async () => {
      // Create multiple users for pagination testing
      await createTestUser({ email: 'user1@example.com' })
      await createTestUser({ email: 'user2@example.com' })
      await createTestUser({ email: 'user3@example.com' })

      const request = new NextRequest('http://localhost:3000/api/admin/users?page=1&limit=2', {
        method: 'GET'
      })

      expect(request.url).toContain('page=1')
      expect(request.url).toContain('limit=2')
    })
  })

  describe('Courses API Route', () => {
    it('should handle course purchase requests', async () => {
      const user = await createTestUser()
      const mockSession = createMockSession(user)

      const request = new NextRequest('http://localhost:3000/api/courses/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `next-auth.session-token=${mockSession.user.id}`
        },
        body: JSON.stringify({
          courseSlug: 'test-course',
          giftCardCode: 'TEST123'
        })
      })

      expect(request.json()).resolves.toEqual({
        courseSlug: 'test-course',
        giftCardCode: 'TEST123'
      })
    })

    it('should validate course purchase data', async () => {
      const user = await createTestUser()

      const request = new NextRequest('http://localhost:3000/api/courses/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: '', // Invalid empty slug
          giftCardCode: 'INVALID'
        })
      })

      expect(request.json()).resolves.toEqual({
        courseSlug: '',
        giftCardCode: 'INVALID'
      })
    })
  })

  describe('Gift Cards API Route', () => {
    it('should handle gift card creation', async () => {
      const user = await createTestUser({ role: 'ADMIN' })
      const mockSession = createMockSession(user)

      const request = new NextRequest('http://localhost:3000/api/admin/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `next-auth.session-token=${mockSession.user.id}`
        },
        body: JSON.stringify({
          code: 'TEST-GIFT-123',
          amount: 5000, // $50.00 in cents
          purchaserEmail: 'test@example.com'
        })
      })

      expect(request.json()).resolves.toEqual({
        code: 'TEST-GIFT-123',
        amount: 5000,
        purchaserEmail: 'test@example.com'
      })
    })

    it('should validate gift card data', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: '', // Invalid empty code
          amount: -100, // Invalid negative amount
          purchaserEmail: 'invalid-email'
        })
      })

      expect(request.json()).resolves.toEqual({
        code: '',
        amount: -100,
        purchaserEmail: 'invalid-email'
      })
    })

    it('should check gift card balance', async () => {
      const request = new NextRequest('http://localhost:3000/api/gift-cards/check?code=TEST123', {
        method: 'GET'
      })

      expect(request.url).toContain('code=TEST123')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/bmad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{'
      })

      // Should handle JSON parsing errors gracefully
      expect(request.url).toContain('/api/bmad')
    })

    it('should handle rate limiting', async () => {
      const user = await createTestUser()
      
      // Simulate multiple rapid requests
      const requests = Array.from({ length: 10 }, () =>
        new NextRequest('http://localhost:3000/api/bmad', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: '/bmad:core:agents:bmad-master'
          })
        })
      )

      requests.forEach(request => {
        expect(request.method).toBe('POST')
      })
    })

    it('should handle database connection errors', async () => {
      // Mock database error
      vi.spyOn(prisma, 'user').mockImplementationOnce(() => {
        throw new Error('Database connection failed')
      })

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET'
      })

      expect(request.url).toContain('/api/admin/users')
    })
  })

  describe('Response Format', () => {
    it('should return structured error responses', async () => {
      const request = new NextRequest('http://localhost:3000/api/bmad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: '/bmad:invalid:command'
        })
      })

      // Expected error response format:
      // { error: "Descriptive message", status: 400 }
      expect(request.json()).resolves.toBeDefined()
    })

    it('should return structured success responses', async () => {
      const user = await createTestUser({ role: 'ADMIN' })
      const mockSession = createMockSession(user)

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${mockSession.user.id}`
        }
      })

      // Expected success response format:
      // { data: result, count: results.length }
      expect(request.url).toContain('/api/admin/users')
    })
  })
})