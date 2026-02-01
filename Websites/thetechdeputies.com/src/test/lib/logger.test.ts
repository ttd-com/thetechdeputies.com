import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { logger } from '../../lib/logger'

describe('Logger', () => {
  let infoSpy: any
  let warnSpy: any
  let errorSpy: any
  let debugSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Spy on console methods
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    // Set NODE_ENV to development for testing
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    infoSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
    debugSpy.mockRestore()
  })

  describe('info', () => {
    it('should log info messages with context', () => {
      const message = 'Test info message'
      const context = { userId: 123, action: 'test' }
      
      logger.info(message, context)
      
      expect(infoSpy).toHaveBeenCalled()
      const call = infoSpy.mock.calls[0]
      expect(call[0]).toContain('INFO: Test info message')
    })

    it('should log info messages without context', () => {
      const message = 'Test info message without context'
      
      logger.info(message)
      
      expect(infoSpy).toHaveBeenCalled()
      const call = infoSpy.mock.calls[0]
      expect(call[0]).toContain('INFO: Test info message without context')
    })
  })

  describe('warn', () => {
    it('should log warning messages with context', () => {
      const message = 'Test warning message'
      const context = { userId: 123, warning: 'test' }
      
      logger.warn(message, context)
      
      expect(warnSpy).toHaveBeenCalled()
      const call = warnSpy.mock.calls[0]
      expect(call[0]).toContain('WARN: Test warning message')
    })
  })

  describe('error', () => {
    it('should log error messages with Error object and context', () => {
      const message = 'Test error message'
      const error = new Error('Test error details')
      const context = { userId: 123, action: 'test' }
      
      logger.error(message, error, context)
      
      expect(errorSpy).toHaveBeenCalled()
      const call = errorSpy.mock.calls[0]
      expect(call[0]).toContain('ERROR: Test error message')
    })

    it('should log error messages with string error and context', () => {
      const message = 'Test error message'
      const error = 'Test error details'
      const context = { userId: 123 }
      
      logger.error(message, error, context)
      
      expect(errorSpy).toHaveBeenCalled()
      const call = errorSpy.mock.calls[0]
      expect(call[0]).toContain('ERROR: Test error message')
    })

    it('should log error messages without context', () => {
      const message = 'Test error message without context'
      const error = new Error('Test error')
      
      logger.error(message, error)
      
      expect(errorSpy).toHaveBeenCalled()
      const call = errorSpy.mock.calls[0]
      expect(call[0]).toContain('ERROR: Test error message without context')
    })
  })

  describe('debug', () => {
    it('should log debug messages with context', () => {
      const message = 'Test debug message'
      const context = { debug: true, data: 'test' }
      
      logger.debug(message, context)
      
      expect(debugSpy).toHaveBeenCalled()
      const call = debugSpy.mock.calls[0]
      expect(call[0]).toContain('DEBUG: Test debug message')
    })

    it('should not log debug messages in production without DEBUG flag', () => {
      process.env.NODE_ENV = 'production'
      vi.clearAllMocks()
      
      const message = 'Debug in production'
      logger.debug(message)
      
      expect(debugSpy).not.toHaveBeenCalled()
    })
  })

  describe('formatMessage', () => {
    it('should format message with timestamp and level', () => {
      const message = 'Test message'
      
      logger.info(message)
      
      expect(infoSpy).toHaveBeenCalled()
      const call = infoSpy.mock.calls[0]
      // Check for timestamp pattern and message
      expect(call[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(call[0]).toContain('INFO: Test message')
    })
  })

  describe('context serialization', () => {
    it('should handle complex context objects', () => {
      const message = 'Complex context test'
      const complexContext = {
        user: { id: 123, email: 'test@example.com' },
        metadata: { source: 'web', version: '1.0.0' },
        timestamp: new Date(),
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } }
      }
      
      logger.info(message, complexContext)
      
      expect(infoSpy).toHaveBeenCalled()
      const call = infoSpy.mock.calls[0]
      expect(call[0]).toContain('INFO: Complex context test')
    })

    it('should handle circular references in context gracefully', () => {
      const message = 'Circular reference test'
      const circularContext: any = { id: 123 }
      circularContext.self = circularContext
      
      // This should not throw
      expect(() => {
        logger.info(message, circularContext)
      }).not.toThrow()
      
      expect(infoSpy).toHaveBeenCalled()
    })
  })
})