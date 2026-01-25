/**
 * BMad Session State Manager
 * 
 * Manages session state and context preservation across BMad command executions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import { BMadResult, BMadCommand } from './types';
import { logger } from '@/lib/logger';

/**
 * Session state schema
 */
export interface BMadSession {
  id: string;
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  currentContext?: {
    activeAgent?: string;
    lastCommand?: string;
    variables?: Record<string, any>;
    workflowState?: Record<string, any>;
  };
  commandHistory: BMadCommandHistory[];
  settings: BMadSessionSettings;
}

/**
 * Command history entry
 */
export interface BMadCommandHistory {
  id: string;
  command: string;
  timestamp: Date;
  result: BMadResult;
  executionTime: number;
  agent?: string;
  variables?: Record<string, any>;
}

/**
 * Session settings
 */
export interface BMadSessionSettings {
  maxHistorySize: number;
  sessionTimeout: number; // minutes
  enableContextPreservation: boolean;
  autoSaveInterval: number; // minutes
  defaultAgent?: string;
  preferredTechniques?: string[];
}

/**
 * Session manager for BMad command system
 */
export class BMadSessionManager {
  private static sessionCache = new Map<string, BMadSession>();
  private static historyFile = '_bmad/sessions/history.json';
  private static sessionsDir = '_bmad/sessions';
  private static maxSessions = 100; // Maximum sessions to keep

  /**
   * Initialize session manager
   */
  static async initialize(): Promise<void> {
    try {
      // Create sessions directory if it doesn't exist
      await fs.mkdir(path.join(process.cwd(), this.sessionsDir), { recursive: true });
      
      // Clean up old sessions
      await this.cleanupOldSessions();
      
      logger.info('BMad Session Manager initialized', {
        sessionsDir: this.sessionsDir,
        historyFile: this.historyFile,
      });
    } catch (error) {
      logger.error('Failed to initialize BMad Session Manager', error as Error);
    }
  }

  /**
   * Get or create a session for user
   */
  static async getSession(userId: string): Promise<BMadSession> {
    // Check cache first
    if (this.sessionCache.has(userId)) {
      const cached = this.sessionCache.get(userId)!;
      cached.lastActiveAt = new Date();
      await this.saveSession(cached);
      return cached;
    }

    // Try to load existing session
    const existingSession = await this.loadSession(userId);
    if (existingSession) {
      this.sessionCache.set(userId, existingSession);
      existingSession.lastActiveAt = new Date();
      await this.saveSession(existingSession);
      return existingSession;
    }

    // Create new session
    const newSession: BMadSession = {
      id: this.generateSessionId(),
      userId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      currentContext: {},
      commandHistory: [],
      settings: this.getDefaultSettings(),
    };

    this.sessionCache.set(userId, newSession);
    await this.saveSession(newSession);
    
    logger.info('Created new BMad session', { userId, sessionId: newSession.id });
    return newSession;
  }

  /**
   * Update session context
   */
  static async updateSessionContext(
    userId: string, 
    updates: Partial<BMadSession['currentContext']>
  ): Promise<void> {
    const session = await this.getSession(userId);
    if (!session) {
      throw new Error(`Session not found for user: ${userId}`);
    }

    session.currentContext = {
      ...session.currentContext,
      ...updates,
    };
    session.lastActiveAt = new Date();

    await this.saveSession(session);
    this.sessionCache.set(userId, session);
    
    logger.debug('Updated session context', { userId, updates });
  }

  /**
   * Add command to session history
   */
  static async addCommandToHistory(
    userId: string,
    command: string,
    result: BMadResult,
    agent?: string
  ): Promise<void> {
    const session = await this.getSession(userId);
    if (!session) {
      throw new Error(`Session not found for user: ${userId}`);
    }

    const historyEntry: BMadCommandHistory = {
      id: this.generateId(),
      command,
      timestamp: new Date(),
      result,
      executionTime: result.executionTime || 0,
      agent,
      variables: session.currentContext?.variables,
    };

    session.commandHistory.push(historyEntry);

    // Trim history if it exceeds max size
    if (session.commandHistory.length > session.settings.maxHistorySize) {
      session.commandHistory = session.commandHistory.slice(-session.settings.maxHistorySize);
    }

    session.lastActiveAt = new Date();
    await this.saveSession(session);
    this.sessionCache.set(userId, session);
  }

  /**
   * Get session command history
   */
  static async getSessionHistory(userId: string, limit?: number): Promise<BMadCommandHistory[]> {
    const session = await this.getSession(userId);
    if (!session) {
      return [];
    }

    const history = session.commandHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).reverse();

    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get session variables
   */
  static async getSessionVariables(userId: string): Promise<Record<string, any>> {
    const session = await this.getSession(userId);
    return session?.currentContext?.variables || {};
  }

  /**
   * Set session variables
   */
  static async setSessionVariables(
    userId: string, 
    variables: Record<string, any>
  ): Promise<void> {
    await this.updateSessionContext(userId, { variables });
  }

  /**
   * Clear session
   */
  static async clearSession(userId: string): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      this.sessionCache.delete(userId);
      
      try {
        const sessionFile = path.join(
          process.cwd(), 
          this.sessionsDir, 
          `${userId}.json`
        );
        await fs.unlink(sessionFile);
      } catch (error) {
        logger.warn('Failed to delete session file', error as Error);
      }
    }
  }

  /**
   * Get all sessions (for admin purposes)
   */
  static async getAllSessions(): Promise<BMadSession[]> {
    try {
      const sessionsDir = path.join(process.cwd(), this.sessionsDir);
      const files = await fs.readdir(sessionsDir);
      const sessions: BMadSession[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(
              path.join(sessionsDir, file), 
              'utf-8'
            );
             const session = JSON.parse(content) as BMadSession;
            sessions.push(session);
          } catch (error) {
            logger.warn('Failed to load session file', error as Error);
          }
        }
      }

       return sessions.sort((a: BMadSession, b: BMadSession) => 
         new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
       );
    } catch (error) {
      logger.error('Failed to get all sessions', error as Error);
      return [];
    }
  }

  /**
   * Save session to file
   */
  private static async saveSession(session: BMadSession): Promise<void> {
    try {
      const sessionDir = path.join(process.cwd(), this.sessionsDir);
      const sessionFile = path.join(sessionDir, `${session.userId}.json`);
      
      await fs.writeFile(sessionFile, JSON.stringify(session, null, 2));
      this.sessionCache.set(session.userId, session);
    } catch (error) {
      logger.error('Failed to save session', error as Error, { sessionId: session.id });
    }
  }

  /**
   * Load session from file
   */
  private static async loadSession(userId: string): Promise<BMadSession | null> {
    try {
      const sessionFile = path.join(
        process.cwd(), 
        this.sessionsDir, 
        `${userId}.json`
      );
      
      const content = await fs.readFile(sessionFile, 'utf-8');
      const session = JSON.parse(content) as BMadSession;
      
      // Validate Session structure
      return this.validateSession(session);
    } catch (error) {
      logger.warn('Failed to load session', error as Error);
      return null;
    }
  }

  /**
   * Validate session structure
   */
  private static validateSession(session: any): BMadSession {
    const sessionSchema = z.object({
      id: z.string(),
      userId: z.string(),
      createdAt: z.date(),
      lastActiveAt: z.date(),
      currentContext: z.object({
        activeAgent: z.string().optional(),
        lastCommand: z.string().optional(),
        variables: z.record(z.string(), z.any()).optional(),
        workflowState: z.record(z.string(), z.any()).optional(),
      }).optional(),
      commandHistory: z.array(z.object({
        id: z.string(),
        command: z.string(),
        timestamp: z.date(),
        result: z.any(),
        executionTime: z.number(),
        agent: z.string().optional(),
        variables: z.record(z.string(), z.any()).optional(),
      })),
      settings: z.object({
        maxHistorySize: z.number(),
        sessionTimeout: z.number(),
        enableContextPreservation: z.boolean(),
        autoSaveInterval: z.number(),
        defaultAgent: z.string().optional(),
        preferredTechniques: z.array(z.string()).optional(),
      }),
    });

    return sessionSchema.parse(session);
  }

  /**
   * Clean up old sessions
   */
  private static async cleanupOldSessions(): Promise<void> {
    try {
      const sessionsDir = path.join(process.cwd(), this.sessionsDir);
      const files = await fs.readdir(sessionsDir);
      const sessionFiles = files.filter(file => file.endsWith('.json'));

      if (sessionFiles.length > this.maxSessions) {
        // Get file stats and sort by last modified
        const fileStats = await Promise.all(
          sessionFiles.map(async (file) => {
            const filePath = path.join(sessionsDir, file);
            const stats = await fs.stat(filePath);
            return { file, stats };
          })
        );

        fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

        // Remove oldest files
        const filesToRemove = fileStats.slice(0, fileStats.length - this.maxSessions);
        
        for (const { file } of filesToRemove) {
          try {
            await fs.unlink(path.join(sessionsDir, file));
            logger.debug('Removed old session file', { file });
          } catch (error) {
            logger.warn('Failed to remove old session file', error as Error);
          }
        }

        logger.info('Cleaned up old sessions', { 
          removed: filesToRemove.length,
          remaining: fileStats.length - filesToRemove.length 
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup old sessions', error as Error);
    }
  }

  /**
   * Generate session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default session settings
   */
  private static getDefaultSettings(): BMadSessionSettings {
    return {
      maxHistorySize: 100,
      sessionTimeout: 60, // 1 hour
      enableContextPreservation: true,
      autoSaveInterval: 5, // 5 minutes
      defaultAgent: undefined,
      preferredTechniques: [],
    };
  }

  /**
   * Update session settings
   */
  static async updateSessionSettings(
    userId: string, 
    settings: Partial<BMadSessionSettings>
  ): Promise<void> {
    const session = await this.getSession(userId);
    if (!session) {
      throw new Error(`Session not found for user: ${userId}`);
    }

    session.settings = {
      ...session.settings,
      ...settings,
    };
    session.lastActiveAt = new Date();

    await this.saveSession(session);
    this.sessionCache.set(userId, session);
    
    logger.info('Updated session settings', { userId, settings });
  }

  /**
   * Get session statistics
   */

  /**
   * Create anonymous session
   */
  static async createAnonymousSession(): Promise<BMadSession> {
    const anonymousSession: BMadSession = {
      id: this.generateSessionId(),
      userId: 'anonymous',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      currentContext: {},
      commandHistory: [],
      settings: this.getDefaultSettings(),
    };

    await this.saveSession(anonymousSession);
    return anonymousSession;
  }
  static async getSessionStats(userId: string): Promise<{
    totalCommands: number;
    averageExecutionTime: number;
    topAgents: Record<string, number>;
    topModules: Record<string, number>;
  }> {
    const session = await this.getSession(userId);
    if (!session) {
      return {
        totalCommands: 0,
        averageExecutionTime: 0,
        topAgents: {},
        topModules: {},
      };
    }

    const history = session.commandHistory || [];
    const totalCommands = history.length;

    // Calculate average execution time
    const avgExecutionTime = history.length > 0 
      ? history.reduce((sum, entry) => sum + entry.executionTime, 0) / history.length 
      : 0;

    // Count by agent
    const agentCounts: Record<string, number> = {};
    for (const entry of history) {
      if (entry.agent) {
        agentCounts[entry.agent] = (agentCounts[entry.agent] || 0) + 1;
      }
    }

    // Count by module (from command parsing)
    const moduleCounts: Record<string, number> = {};
    for (const entry of history) {
      try {
        const match = entry.command.match(/^\/bmad:([^:]+):/);
        if (match && match[1]) {
          moduleCounts[match[1]] = (moduleCounts[match[1]] || 0) + 1;
        }
      } catch {
        // Skip invalid commands
      }
    }

    return {
      totalCommands,
      averageExecutionTime: Math.round(avgExecutionTime),
      topAgents: agentCounts,
      topModules: moduleCounts,
    };
  }
}