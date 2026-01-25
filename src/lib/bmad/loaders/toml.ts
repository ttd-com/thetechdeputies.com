/**
 * BMad TOML Command Loader
 * 
 * Loads and parses TOML command definitions from .gemini/commands/
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parse as parseTOML } from 'toml';
import { BMadCommandDefinition, ParsedTOMLCommand } from '../types';
import { logger } from '@/lib/logger';

export class TOMLCommandLoader {
  private static commandCache = new Map<string, BMadCommandDefinition>();

  /**
   * Load all TOML commands from .gemini/commands/ directory
   */
  static async loadAllCommands(): Promise<Map<string, BMadCommandDefinition>> {
    const startTime = Date.now();
    
    try {
      const commandsDir = path.join(process.cwd(), '.gemini/commands');
      
      // Check if directory exists
      try {
        await fs.access(commandsDir);
      } catch {
        logger.warn('BMad commands directory not found', { path: commandsDir });
        return new Map();
      }

      // Read all TOML files
      const files = await fs.readdir(commandsDir);
      const tomlFiles = files.filter(file => file.endsWith('.toml'));
      
      logger.info(`Loading BMad TOML commands`, { fileCount: tomlFiles.length });

      for (const file of tomlFiles) {
        try {
          const command = await this.parseTOMLFile(path.join(commandsDir, file));
          if (command) {
            this.commandCache.set(`${command.module}:${command.type}:${command.name}`, command);
          }
        } catch (error) {
          logger.error('Failed to load TOML command', error as Error, { file });
        }
      }

      logger.info(`BMad TOML commands loaded`, { 
        count: this.commandCache.size,
        executionTime: Date.now() - startTime 
      });

      return new Map(this.commandCache);
    } catch (error) {
      logger.error('Failed to load TOML commands directory', error as Error);
      return new Map();
    }
  }

  /**
   * Get a specific command by module, type, and name
   */
  static async getCommand(
    module: string, 
    type: string, 
    name: string
  ): Promise<BMadCommandDefinition | null> {
    const key = `${module}:${type}:${name}`;
    
    // Check cache first
    if (this.commandCache.has(key)) {
      return this.commandCache.get(key)!;
    }

    // Load on demand
    await this.loadAllCommands();
    return this.commandCache.get(key) || null;
  }

  /**
   * Get all commands for a specific module
   */
  static async getModuleCommands(module: string): Promise<BMadCommandDefinition[]> {
    await this.loadAllCommands();
    
    const commands: BMadCommandDefinition[] = [];
    for (const command of this.commandCache.values()) {
      if (command.module === module) {
        commands.push(command);
      }
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all commands for a specific type
   */
  static async getTypeCommands(type: string): Promise<BMadCommandDefinition[]> {
    await this.loadAllCommands();
    
    const commands: BMadCommandDefinition[] = [];
    for (const command of this.commandCache.values()) {
      if (command.type === type) {
        commands.push(command);
      }
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Search commands by name (fuzzy matching)
   */
  static async searchCommands(query: string): Promise<BMadCommandDefinition[]> {
    await this.loadAllCommands();
    
    const lowerQuery = query.toLowerCase();
    const results: BMadCommandDefinition[] = [];
    
    for (const command of this.commandCache.values()) {
      const searchString = `${command.module}:${command.type}:${command.name}`.toLowerCase();
      if (searchString.includes(lowerQuery) || command.name.toLowerCase().includes(lowerQuery)) {
        results.push(command);
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
   * Parse a single TOML file
   */
  private static async parseTOMLFile(filePath: string): Promise<BMadCommandDefinition | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = parseTOML(content) as ParsedTOMLCommand;
      
      // Extract metadata from filename
      const fileName = path.basename(filePath, '.toml');
      const metadata = this.extractMetadataFromFilename(fileName);
      
      if (!metadata) {
        logger.warn('Invalid TOML filename format', { fileName });
        return null;
      }

      return {
        name: metadata.name,
        description: parsed.description || 'No description available',
        type: metadata.type,
        module: metadata.module,
        prompt: parsed.prompt || '',
        filePath,
      };
    } catch (error) {
      logger.error('Failed to parse TOML file', error as Error, { filePath });
      return null;
    }
  }

  /**
   * Extract metadata from TOML filename
   * Expected format: bmad-{type}-{module}-{name}.toml
   */
  private static extractMetadataFromFilename(fileName: string): {
    type: 'workflow' | 'agent' | 'task';
    module: 'core' | 'bmm' | 'bmb' | 'cis';
    name: string;
  } | null {
    const match = fileName.match(/^bmad-(workflow|agent|task)-(core|bmm|bmb|cis)-(.+)$/);
    
    if (!match) {
      return null;
    }

    return {
      type: match[1] as 'workflow' | 'agent' | 'task',
      module: match[2] as 'core' | 'bmm' | 'bmb' | 'cis',
      name: match[3],
    };
  }

  /**
   * Clear command cache (useful for development)
   */
  static clearCache(): void {
    this.commandCache.clear();
    logger.info('BMad TOML command cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalCommands: number;
    commandsByModule: Record<string, number>;
    commandsByType: Record<string, number>;
  } {
    const commandsByModule: Record<string, number> = {};
    const commandsByType: Record<string, number> = {};
    
    for (const command of this.commandCache.values()) {
      commandsByModule[command.module] = (commandsByModule[command.module] || 0) + 1;
      commandsByType[command.type] = (commandsByType[command.type] || 0) + 1;
    }

    return {
      totalCommands: this.commandCache.size,
      commandsByModule,
      commandsByType,
    };
  }
}