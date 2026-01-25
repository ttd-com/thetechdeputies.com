/**
 * BMad Fuzzy Command Matcher
 * 
 * Provides intelligent command matching and auto-completion for BMad commands
 */

import { BMadCommandDefinition, BMadAgentDefinition } from './types';
import { BMadEngine } from './index';
import { logger } from '@/lib/logger';

export interface CommandMatch {
  command: BMadCommandDefinition | BMadAgentDefinition;
  type: 'exact' | 'partial' | 'fuzzy' | 'contextual';
  score: number;
  distance: number;
  highlighted: string[];
}

export interface BMadCommandDefinitionExtended extends BMadCommandDefinition {
  tokens: string[];
}

export interface BMadAgentDefinitionExtended extends BMadAgentDefinition {
  tokens: string[];
}

export interface AutoCompletionResult {
  query: string;
  suggestions: CommandMatch[];
  totalFound: number;
}

export class BMadCommandMatcher {
  private static cache = new Map<string, BMadCommandDefinition>();
  private static agentCache = new Map<string, BMadAgentDefinition>();

  /**
   * Get fuzzy matches for a query
   */
  static async getMatches(query: string): Promise<CommandMatch[]> {
    const startTime = Date.now();
    
    try {
      // Load all commands and agents
      const [commands, agents] = await Promise.all([
        BMadEngine.getStats().then(stats => stats.commands),
        BMadEngine.getStats().then(stats => stats.agents),
      ]);

      // Build search index
      this.buildSearchIndex(commands, agents);
      
      // Perform matching
      const matches = this.performFuzzyMatching(query, commands, agents);
      
      logger.info('BMad command matching completed', {
        query,
        matchesFound: matches.length,
        executionTime: Date.now() - startTime,
      });
      
      return matches;
    } catch (error) {
      logger.error('Failed to get BMad command matches', error as Error, { query });
      return [];
    }
  }

  /**
   * Get auto-completion suggestions
   */
  static async getAutoCompletion(query: string, limit = 5): Promise<AutoCompletionResult> {
    const matches = await this.getMatches(query);
    
    // Sort by score and relevance
    const sortedMatches = matches
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.type === 'exact' && b.type !== 'exact') return -1;
        if (b.type === 'exact' && a.type !== 'exact') return 1;
        
        // Then by score (higher is better)
        return b.score - a.score;
      })
      .slice(0, limit);

    return {
      query,
      suggestions: sortedMatches,
      totalFound: matches.length,
    };
  }

  /**
   * Build search index for fast matching
   */
  private static buildSearchIndex(
    commands: BMadCommandDefinition[],
    agents: BMadAgentDefinition[]
  ): void {
    // Clear existing cache
    this.cache.clear();
    this.agentCache.clear();
    
    // Index commands
    for (const command of commands) {
      this.cache.set(`${command.module}:${command.type}:${command.name}`, command);
    }
    
    // Index agents
    for (const agent of agents) {
      this.agentCache.set(`${agent.module}:agents:${agent.name}`, agent);
    }
    
    logger.debug('BMad search index built', {
      commandsIndexed: commands.length,
      agentsIndexed: agents.length,
    });
  }

  /**
   * Perform fuzzy matching using multiple strategies
   */
  private static performFuzzyMatching(
    query: string,
    commands: BMadCommandDefinition[],
    agents: BMadAgentDefinition[]
  ): CommandMatch[] {
    const queryLower = query.toLowerCase();
    const results: CommandMatch[] = [];
    
    // 1. Exact matches (highest priority)
    results.push(...this.findExactMatches(queryLower, commands));
    
    // 2. Partial matches (medium priority)
    results.push(...this.findPartialMatches(queryLower, commands));
    results.push(...this.findPartialMatches(queryLower, agents as any));
    
    // 3. Fuzzy matches (lowest priority)
    results.push(...this.findFuzzyMatches(queryLower, commands, 0.6));
    results.push(...this.findFuzzyMatches(queryLower, agents as any, 0.6));
    
    // 4. Contextual matches (bonus points)
    results.push(...this.findContextualMatches(queryLower, commands, agents));
    
    // Sort by relevance and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to top 20 results
  }

  /**
   * Find exact matches
   */
  private static findExactMatches(
    query: string,
    commands: BMadCommandDefinition[]
  ): CommandMatch[] {
    const matches: CommandMatch[] = [];
    
    for (const command of commands) {
      if (command.name.toLowerCase() === query) {
        matches.push({
          command,
          type: 'exact',
          score: 100,
          distance: 0,
          highlighted: [command.name],
        });
      }
    }
    
    return matches;
  }

  /**
   * Find partial matches
   */
  private static findPartialMatches(
    query: string,
    commands: BMadCommandDefinition[],
    minMatchLength = 3
  ): CommandMatch[] {
    const matches: CommandMatch[] = [];
    
    for (const command of commands) {
      const nameLower = command.name.toLowerCase();
      
      // Check if query is contained in command name
      if (nameLower.includes(query) && query.length >= minMatchLength) {
        const score = this.calculatePartialScore(query, nameLower);
        if (score > 0.3) {
          const highlighted = this.getHighlightedParts(query, nameLower);
          matches.push({
            command,
            type: 'partial',
            score,
            distance: this.levenshteinDistance(query, nameLower),
            highlighted,
          });
        }
      }
    }
    
    return matches;
  }

  /**
   * Find fuzzy matches using Levenshtein distance
   */
  private static findFuzzyMatches(
    query: string,
    commands: BMadCommandDefinition[],
    threshold: number
  ): CommandMatch[] {
    const matches: CommandMatch[] = [];
    
    for (const command of commands) {
      const distance = this.levenshteinDistance(query, command.name.toLowerCase());
      const maxLength = Math.max(query.length, command.name.length);
      const similarity = 1 - (distance / maxLength);
      
      if (similarity >= threshold) {
        const score = similarity * 100;
        const highlighted = this.getHighlightedParts(query, command.name.toLowerCase());
        matches.push({
          command,
          type: 'fuzzy',
          score,
          distance,
          highlighted,
        });
      }
    }
    
    return matches;
  }

  /**
   * Find contextual matches based on tokens
   */
  private static findContextualMatches(
    query: string,
    commands: BMadCommandDefinition[],
    agents: BMadAgentDefinition[]
  ): CommandMatch[] {
    const matches: CommandMatch[] = [];
    const queryTokens = query.split(' ').filter(token => token.length > 2);
    
    // Create search tokens for commands
    for (const command of commands) {
      const commandTokens = [
        `${command.module}:${command.type}:${command.name}`.toLowerCase(),
        command.name.toLowerCase(),
        command.description.toLowerCase(),
        ...command.name.split(' '),
      ];
      
      for (const token of queryTokens) {
        if (commandTokens.includes(token)) {
          matches.push({
            command,
            type: 'contextual',
            score: 50, // Bonus for contextual relevance
            distance: 0,
            highlighted: [token],
          });
          break; // One bonus per command is enough
        }
      }
    }
    
    // Create search tokens for agents
    for (const agent of agents) {
      const agentTokens = [
        `${agent.module}:agents:${agent.name}`.toLowerCase(),
        agent.name.toLowerCase(),
        agent.description.toLowerCase(),
        ...agent.name.split(' '),
      ];
      
      for (const token of queryTokens) {
        if (agentTokens.includes(token)) {
          matches.push({
            command: agent,
            type: 'contextual',
            score: 50, // Bonus for contextual relevance
            distance: 0,
            highlighted: [token],
          });
          break; // One bonus per agent is enough
        }
      }
    }
    
    return matches;
  }

  /**
   * Calculate partial match score
   */
  private static calculatePartialScore(query: string, target: string): number {
    let score = 0;
    
    // Exact prefix bonus
    if (target.startsWith(query)) {
      score += 0.5;
    }
    
    // Length similarity
    const lengthRatio = query.length / target.length;
    if (lengthRatio > 0.7) {
      score += 0.3;
    } else if (lengthRatio > 0.5) {
      score += 0.2;
    }
    
    return score;
  }

  /**
   * Get highlighted parts of match
   */
  private static getHighlightedParts(query: string, target: string): string[] {
    const highlighted: string[] = [];
    let targetLower = target.toLowerCase();
    let pos = 0;
    
    for (let i = 0; i < query.length; i++) {
      const queryChar = query[i].toLowerCase();
      pos = targetLower.indexOf(queryChar, pos);
      
      if (pos !== -1) {
        highlighted.push(target.substring(pos, pos + queryChar.length));
        targetLower = targetLower.substring(0, pos) + 
                    '【' + queryChar + '】' + 
                    targetLower.substring(pos + queryChar.length);
        pos += queryChar.length;
      }
    }
    
    return highlighted;
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Initialize distance matrix
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i][j - 1] + cost
        );
      }
    }
    
    // Calculate distance
    return matrix[len1][len2];
  }

  /**
   * Get command statistics
   */
  static getStats(): {
    totalCommands: number;
    commandsByModule: Record<string, number>;
    agentsByModule: Record<string, number>;
    cacheSize: number;
  } {
    const totalCommands = this.cache.size;
    const commandsByModule: Record<string, number> = {};
    const agentsByModule: Record<string, number> = {};
    
    for (const command of this.cache.values()) {
      commandsByModule[command.module] = (commandsByModule[command.module] || 0) + 1;
    }
    
    for (const agent of this.agentCache.values()) {
      agentsByModule[agent.module] = (agentsByModule[agent.module] || 0) + 1;
    }
    
    return {
      totalCommands,
      commandsByModule,
      agentsByModule,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
    this.agentCache.clear();
    logger.debug('BMad command matcher cache cleared');
  }
}