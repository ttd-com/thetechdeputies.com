import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logger } from '../../lib/logger'

// Mock console methods to test logging
const mockConsole = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods
    global.console.info = mockConsole.info
    global.console.warn = mockConsole.warn
    global.console.error = mockConsole.error
    global.console.debug = mockConsole.debug
  })

  describe('info', () => {
    it('should log info messages with context', () => {
      const message = 'Test info message'
      const context = { userId: 123, action: 'test' }
      
      logger.info(message, context)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test info message'),
        expect.any(Object)
      )
    })

    it('should log info messages without context', () => {
      const message = 'Test info message without context'
      
      logger.info(message)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test info message without context')
      )
    })
  })

  describe('warn', () => {
    it('should log warning messages with context', () => {
      const message = 'Test warning message'
      const context = { userId: 123, warning: 'test' }
      
      logger.warn(message, context)
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN: Test warning message'),
        expect.any(Object)
      )
    })
  })

  describe('error', () => {
    it('should log error messages with Error object and context', () => {
      const message = 'Test error message'
      const error = new Error('Test error details')
      const context = { userId: 123, action: 'test' }
      
      logger.error(message, error, context)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message'),
        error,
        expect.any(Object)
      )
    })

    it('should log error messages with string error and context', () => {
      const message = 'Test error message'
      const error = 'Test error details'
      const context = { userId: 123 }
      
      logger.error(message, error, context)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message'),
        error,
        expect.any(Object)
      )
    })

    it('should log error messages without context', () => {
      const message = 'Test error message without context'
      const error = new Error('Test error')
      
      logger.error(message, error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message without context'),
        error
      )
    })
  })

  describe('debug', () => {
    it('should log debug messages with context', () => {
      const message = 'Test debug message'
      const context = { debug: true, data: 'test' }
      
      logger.debug(message, context)
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG: Test debug message'),
        expect.any(Object)
      )
    })
  })

  describe('formatMessage', () => {
    it('should format message with timestamp and level', () => {
      const message = 'Test message'
      const level = 'INFO'
      
      logger.info(message)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test message$/)
      )
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
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Complex context test'),
        expect.objectContaining({
          user: { id: 123, email: 'test@example.com' },
          metadata: { source: 'web', version: '1.0.0' },
          array: [1, 2, 3],
          nested: { deep: { value: 'test' } }
        })
      )
    })

    it('should handle circular references in context', () => {
      const message = 'Circular reference test'
      const circularContext: any = { id: 123 }
      circularContext.self = circularContext
      
      logger.info(message, circularContext)
      
      expect(mockConsole.info).toHaveBeenCalled()
      // Should not throw error with circular references
    })
  })
})