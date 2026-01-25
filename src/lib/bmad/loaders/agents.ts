/**
 * BMad GitHub Agent Loader
 * 
 * Loads and parses GitHub agent definitions from .github/agents/
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BMadAgentDefinition } from '../types';
import { logger } from '@/lib/logger';

export class GitHubAgentLoader {
  private static agentCache = new Map<string, BMadAgentDefinition>();

  /**
   * Load all GitHub agents from .github/agents/ directory
   */
  static async loadAllAgents(): Promise<Map<string, BMadAgentDefinition>> {
    const startTime = Date.now();
    
    try {
      const agentsDir = path.join(process.cwd(), '.github/agents');
      
      // Check if directory exists
      try {
        await fs.access(agentsDir);
      } catch {
        logger.warn('BMad agents directory not found', { path: agentsDir });
        return new Map();
      }

      // Read all agent files
      const files = await fs.readdir(agentsDir);
      const agentFiles = files.filter(file => file.endsWith('.agent.md'));
      
      logger.info(`Loading BMad GitHub agents`, { fileCount: agentFiles.length });

      for (const file of agentFiles) {
        try {
          const agent = await this.parseAgentFile(path.join(agentsDir, file));
          if (agent) {
            this.agentCache.set(`${agent.module}:${agent.name}`, agent);
          }
        } catch (error) {
          logger.error('Failed to load agent', error as Error, { file });
        }
      }

      logger.info(`BMad GitHub agents loaded`, { 
        count: this.agentCache.size,
        executionTime: Date.now() - startTime 
      });

      return new Map(this.agentCache);
    } catch (error) {
      logger.error('Failed to load agents directory', error as Error);
      return new Map();
    }
  }

  /**
   * Get a specific agent by module and name
   */
  static async getAgent(
    module: string, 
    name: string
  ): Promise<BMadAgentDefinition | null> {
    const key = `${module}:${name}`;
    
    // Check cache first
    if (this.agentCache.has(key)) {
      return this.agentCache.get(key)!;
    }

    // Load on demand
    await this.loadAllAgents();
    return this.agentCache.get(key) || null;
  }

  /**
   * Get all agents for a specific module
   */
  static async getModuleAgents(module: string): Promise<BMadAgentDefinition[]> {
    await this.loadAllAgents();
    
    const agents: BMadAgentDefinition[] = [];
    for (const agent of this.agentCache.values()) {
      if (agent.module === module) {
        agents.push(agent);
      }
    }
    
    return agents.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Search agents by name (fuzzy matching)
   */
  static async searchAgents(query: string): Promise<BMadAgentDefinition[]> {
    await this.loadAllAgents();
    
    const lowerQuery = query.toLowerCase();
    const results: BMadAgentDefinition[] = [];
    
    for (const agent of this.agentCache.values()) {
      const searchString = `${agent.module}:${agent.name}`.toLowerCase();
      if (searchString.includes(lowerQuery) || 
          agent.name.toLowerCase().includes(lowerQuery) ||
          agent.description.toLowerCase().includes(lowerQuery)) {
        results.push(agent);
      }
    }
    
    return results.sort((a, b) => {
      // Exact matches first
      const aExact = a.name.toLowerCase() === lowerQuery;
      const bExact = b.name.toLowerCase() === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Parse a single agent file
   */
  private static async parseAgentFile(filePath: string): Promise<BMadAgentDefinition | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract metadata from filename
      const fileName = path.basename(filePath);
      const metadata = this.extractMetadataFromFilename(fileName);
      
      if (!metadata) {
        logger.warn('Invalid agent filename format', { fileName });
        return null;
      }

      return {
        name: metadata.name,
        description: this.extractDescription(content) || 'No description available',
        module: metadata.module,
        content,
        filePath,
      };
    } catch (error) {
      logger.error('Failed to parse agent file', error as Error, { filePath });
      return null;
    }
  }

  /**
   * Extract metadata from agent filename
   * Expected format: bmd-custom-{module}-{name}.agent.md
   */
  private static extractMetadataFromFilename(fileName: string): {
    module: 'core' | 'bmm' | 'bmb' | 'cis';
    name: string;
  } | null {
    const match = fileName.match(/^bmd-custom-(core|bmm|bmb|cis)-(.+)\.agent\.md$/);
    
    if (!match) {
      return null;
    }

    return {
      module: match[1] as 'core' | 'bmm' | 'bmb' | 'cis',
      name: match[2],
    };
  }

  /**
   * Extract description from agent content (frontmatter or first line)
   */
  private static extractDescription(content: string): string | null {
    try {
      // Try to extract from YAML frontmatter
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const descMatch = frontmatter.match(/^description:\s*"(.+)"/m);
        if (descMatch) {
          return descMatch[1];
        }
      }
      
      // Fallback: use first non-empty line
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
          return trimmed.length > 100 ? trimmed.substring(0, 97) + '...' : trimmed;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get agent activation content (the part after frontmatter)
   */
  static getAgentActivationContent(agent: BMadAgentDefinition): string {
    try {
      // Remove frontmatter if present
      const frontmatterMatch = agent.content.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
      if (frontmatterMatch) {
        return frontmatterMatch[1].trim();
      }
      
      return agent.content.trim();
    } catch {
      return agent.content;
    }
  }

  /**
   * Clear agent cache (useful for development)
   */
  static clearCache(): void {
    this.agentCache.clear();
    logger.info('BMad GitHub agent cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalAgents: number;
    agentsByModule: Record<string, number>;
  } {
    const agentsByModule: Record<string, number> = {};
    
    for (const agent of this.agentCache.values()) {
      agentsByModule[agent.module] = (agentsByModule[agent.module] || 0) + 1;
    }

    return {
      totalAgents: this.agentCache.size,
      agentsByModule,
    };
  }
}