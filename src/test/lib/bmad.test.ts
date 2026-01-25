import { describe, it, expect, beforeEach } from 'vitest'
import { BMadEngine } from '../../lib/bmad'
import { vi } from 'vitest'

// Mock the BMad dependencies
vi.mock('../../lib/bmad/loaders/toml', () => ({
  TOMLCommandLoader: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getAllCommands: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../../lib/bmad/loaders/agents', () => ({
  GitHubAgentLoader: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getAllAgents: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../../lib/bmad/session-manager', () => ({
  BMadSessionManager: {
    initialize: vi.fn().mockResolvedValue(undefined),
    createAnonymousSession: vi.fn().mockResolvedValue({
      id: 'test-session',
      userId: 'anonymous',
      context: {},
      history: []
    })
  }
}))

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('BMadEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('should initialize all components successfully', async () => {
      const result = await BMadEngine.initialize()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('getHelp', () => {
    it('should return help text for available commands', async () => {
      const help = await BMadEngine.getHelp()
      
      expect(typeof help).toBe('string')
      expect(help).toContain('Available BMad Commands')
    })

    it('should include command categories in help', async () => {
      const help = await BMadEngine.getHelp()
      
      expect(help).toMatch(/bmm|core|cis|workflow/i)
    })
  })

  describe('search', () => {
    it('should return search results for valid queries', async () => {
      const results = await BMadEngine.search('help')
      
      expect(results).toHaveProperty('data')
      expect(results.data).toHaveProperty('commands')
      expect(results.data).toHaveProperty('agents')
      expect(Array.isArray(results.data.commands)).toBe(true)
      expect(Array.isArray(results.data.agents)).toBe(true)
    })

    it('should handle empty search queries', async () => {
      const results = await BMadEngine.search('')
      
      expect(results.success).toBe(true)
      expect(results.data).toBeDefined()
    })

    it('should handle special characters in search', async () => {
      const results = await BMadEngine.search('@#$%^&*()')
      
      expect(results.success).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should return system statistics', async () => {
      const stats = await BMadEngine.getStats()
      
      expect(stats).toHaveProperty('data')
      expect(stats.data).toHaveProperty('commands')
      expect(stats.data).toHaveProperty('agents')
      expect(stats.data).toHaveProperty('sessions')
      expect(typeof stats.data.commands).toBe('number')
      expect(typeof stats.data.agents).toBe('number')
    })
  })

  describe('execute with invalid commands', () => {
    it('should handle malformed BMad commands', async () => {
      const result = await BMadEngine.execute('invalid-command')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid BMad command format')
    })

    it('should handle commands with missing components', async () => {
      const result = await BMadEngine.execute('/bmad:module')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid BMad command format')
    })

    it('should handle commands with extra components', async () => {
      const result = await BMadEngine.execute('/bmad:module:type:name:extra')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid BMad command format')
    })
  })

  describe('execute with valid but non-existent commands', () => {
    it('should handle non-existent modules', async () => {
      const result = await BMadEngine.execute('/bmad:nonexistent:type:name')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Module not found')
    })

    it('should handle non-existent command types', async () => {
      const result = await BMadEngine.execute('/bmad:bmm:nonexistent:name')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Command type not found')
    })

    it('should handle non-existent command names', async () => {
      const result = await BMadEngine.execute('/bmad:bmm:workflows:nonexistent')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Command not found')
    })
  })

  describe('session management', () => {
    it('should create anonymous sessions by default', async () => {
      const result = await BMadEngine.execute('/bmad:core:agents:bmad-master')
      
      // Should not throw error and should create session
      expect(result).toBeDefined()
    })

    it('should handle session creation failures gracefully', async () => {
      // Mock session manager to throw error
      vi.doMock('../../lib/bmad/session-manager', () => ({
        BMadSessionManager: {
          initialize: vi.fn().mockRejectedValue(new Error('Session error'))
        }
      }))

      const result = await BMadEngine.execute('/bmad:core:agents:bmad-master')
      
      expect(result.success).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle loader initialization errors', async () => {
      vi.doMock('../../lib/bmad/loaders/toml', () => ({
        TOMLCommandLoader: {
          initialize: vi.fn().mockRejectedValue(new Error('Loader error'))
        }
      }))

      const result = await BMadEngine.initialize()
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('BMad initialization failed')
    })

    it('should handle parser errors gracefully', async () => {
      vi.doMock('../../lib/bmad/parser', () => ({
        BMadParser: {
          parse: vi.fn().mockReturnValue({
            success: false,
            error: 'Parser error'
          })
        }
      }))

      const result = await BMadEngine.execute('/bmad:bmm:agents:dev')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Parser error')
    })
  })
})