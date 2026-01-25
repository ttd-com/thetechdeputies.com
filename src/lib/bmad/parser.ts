/**
 * BMad Command Parser
 * 
 * Parses /bmad:{module}:{type}:{name} syntax and validates commands
 */

import { z } from 'zod';
import { BMadCommand, BMadResult } from './types';

// BMad command validation schema
const BMadCommandSchema = z.object({
  module: z.enum(['core', 'bmm', 'bmb', 'cis']),
  type: z.enum(['workflows', 'agents', 'tasks']),
  name: z.string().min(1),
  parameters: z.record(z.string(), z.any()).optional(),
});

const COMMAND_REGEX = /^\/bmad:(core|bmm|bmb|cis):(workflows|agents|tasks):([^:]+)(?::(.+))?$/;

export class BMadParser {
/**
 * Parse a BMad command string
 */
static parse(input: string): BMadResult & { data?: { command: BMadCommand } } {
    const startTime = Date.now();

    try {
      // Trim and validate input
      const trimmedInput = input.trim();
      
      if (!trimmedInput.startsWith('/bmad:')) {
        return {
          success: false,
          error: 'Invalid BMad command format. Must start with /bmad:',
          executionTime: Date.now() - startTime,
        };
      }

      // Parse command using regex
      const match = trimmedInput.match(COMMAND_REGEX);
      if (!match) {
        return {
          success: false,
          error: 'Invalid BMad command format. Expected: /bmad:{module}:{type}:{name}',
          executionTime: Date.now() - startTime,
        };
      }

      const [, module, type, name, parameters] = match;
      
      // Parse parameters if present
      let commandParameters: Record<string, any> = {};
      if (parameters) {
        try {
          // Simple key:value parsing separated by commas
          commandParameters = parameters
            .split(',')
            .map((param: string) => {
              const [key, ...valueParts] = param.split('=');
              return {
                key: key.trim(),
                value: valueParts.join('=').trim()
              };
            })
            .filter((param: any) => param.key)
            .reduce((acc: Record<string, any>, param: any) => {
              acc[param.key] = param.value || true;
              return acc;
            }, {});
        } catch (paramError) {
          return {
            success: false,
            error: `Failed to parse parameters: ${paramError instanceof Error ? paramError.message : 'Unknown error'}`,
            executionTime: Date.now() - startTime,
          };
        }
      }

      // Create command object
      const command: BMadCommand = {
        module: module as 'core' | 'bmm' | 'bmb' | 'cis',
        type: type as 'workflows' | 'agents' | 'tasks',
        name: name.trim(),
        parameters: commandParameters,
        originalInput: trimmedInput,
      };

      // Validate against schema
      const validationResult = BMadCommandSchema.safeParse(command);
      if (!validationResult.success) {
        return {
          success: false,
          error: `Command validation failed: ${validationResult.error.message}`,
          executionTime: Date.now() - startTime,
        };
      }

      return {
        success: true,
        data: { command: validationResult.data },
        executionTime: Date.now() - startTime,
      } as BMadResult<{ command: BMadCommand }>;

    } catch (error) {
      return {
        success: false,
        error: `Failed to parse BMad command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate if a module is supported
   */
  static isValidModule(module: string): module is 'core' | 'bmm' | 'bmb' | 'cis' {
    return ['core', 'bmm', 'bmb', 'cis'].includes(module);
  }

  /**
   * Validate if a type is supported
   */
  static isValidType(type: string): type is 'workflows' | 'agents' | 'tasks' {
    return ['workflows', 'agents', 'tasks'].includes(type);
  }

  /**
   * Get help information for BMad commands
   */
  static getHelp(): string {
    return `
BMad Command Help

Syntax: /bmad:{module}:{type}:{name}[:parameters]

Modules:
  core    - Core BMad system commands and utilities
  bmm     - BMad Method (project management, development workflows)
  bmb     - BMad Builder (create agents, workflows, modules)
  cis     - Creative Innovation Suite (brainstorming, design thinking)

Types:
  workflows - Structured workflows for specific tasks
  agents    - AI agents with specialized personas and menus
  tasks     - Individual task execution

Examples:
  /bmad:core:agents:bmad-master          # Load master orchestrator
  /bmad:bmm:workflows:prd               # Create Product Requirements Doc
  /bmad:cis:workflows:brainstorming     # Start brainstorming session
  /bmad:bmm:agents:dev                  # Load developer agent

Parameters (optional):
  /bmad:bmm:workflows:prd:mode=quick,output=docs
    `.trim();
  }

  /**
   * Extract file path from TOML command naming convention
   */
  static extractTOMLPath(command: BMadCommand): string {
    const { module, type, name } = command;
    return `.gemini/commands/bmad-${type}-${module}-${name}.toml`;
  }

  /**
   * Extract agent file path from GitHub agent naming convention
   */
  static extractAgentPath(command: BMadCommand): string {
    const { module, name } = command;
    return `.github/agents/bmd-custom-${module}-${name}.agent.md`;
  }
}