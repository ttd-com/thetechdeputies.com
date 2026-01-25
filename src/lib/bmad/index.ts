/**
 * BMad System Main Export
 * 
 * Primary interface for the BMad command system
 */

import { BMadCommand, BMadResult, BMadCommandDefinition, BMadAgentDefinition, VariableContext } from './types';
import { BMadParser } from './parser';
import { TOMLCommandLoader } from './loaders/toml';
import { GitHubAgentLoader } from './loaders/agents';
import { VariableResolver } from './resolver';
import { BMadSessionManager } from './session-manager';
import { logger } from '@/lib/logger';

// Export all components
export { BMadParser } from './parser';
export { TOMLCommandLoader } from './loaders/toml';
export { GitHubAgentLoader } from './loaders/agents';
export { VariableResolver } from './resolver';
export { BMadSessionManager } from './session-manager';
export { BMadCommandMatcher } from './fuzzy-matcher';

// Export types
export type {
  BMadCommand,
  BMadResult,
  BMadCommandDefinition,
  BMadAgentDefinition,
  VariableContext,
  ParsedTOMLCommand,
} from './types';

/**
 * Main BMad execution engine
 */
export class BMadEngine {
  /**
   * Execute a BMad command
   */
  static async execute(
    commandInput: string,
    session?: any,
    options?: {
      preserveSession?: boolean;
      sessionId?: string;
      enableFuzzy?: boolean;
    }
  ): Promise<BMadResult> {
    const startTime = Date.now();
    
    try {
      // Parse the command
      const parseResult = BMadParser.parse(commandInput);
      if (!parseResult.success) {
        return {
          ...parseResult,
          executionTime: Date.now() - startTime,
        };
      }

      const command = parseResult.data!.command;
      
      // Create variable context
      const context = VariableResolver.createContext(session, command);
      
      logger.info('Executing BMad command', {
        command: command.originalInput,
        module: command.module,
        type: command.type,
        name: command.name,
        userId: session?.user?.id,
      });

      // Initialize session manager if session preservation is enabled
      let bmadSession: any;
      if (session?.user?.id && (options?.preserveSession !== false)) {
        await BMadSessionManager.initialize();
        
        // Get or create session
        bmadSession = options?.sessionId 
          ? await BMadSessionManager.getSession(options.sessionId)
          : await BMadSessionManager.getSession(session.user.id);
        
        // Update session context with command info
        await BMadSessionManager.updateSessionContext(bmadSession.userId, {
          lastCommand: command.originalInput,
          activeAgent: command.type === 'agents' ? command.name : undefined,
        });
      }

      // Execute based on command type
      let result: BMadResult;

      switch (command.type) {
        case 'workflows':
          result = await this.executeWorkflow(command, context);
          break;
        case 'agents':
          result = await this.executeAgent(command, context);
          break;
        case 'tasks':
          result = await this.executeTask(command, context);
          break;
        default:
          result = {
            success: false,
            error: `Unsupported command type: ${command.type}`,
            executionTime: Date.now() - startTime,
          };
      }

      // Add command to session history if session is active
      if (bmadSession) {
        await BMadSessionManager.addCommandToHistory(
          bmadSession.userId,
          commandInput,
          result,
          command.type === 'agents' ? command.name : undefined
        );
      }

      // Add execution time and details
      return {
        ...result,
        executionTime: Date.now() - startTime,
        bmadDetails: {
          command: command.originalInput,
          ...result.bmadDetails,
        },
      };

    } catch (error) {
      logger.error('BMad command execution failed', error as Error, { commandInput });
      
      return {
        success: false,
        error: `BMad execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: Date.now() - startTime,
        bmadDetails: {
          command: commandInput,
          phase: 'execution',
          originalError: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Execute a workflow command
   */
  private static async executeWorkflow(
    command: BMadCommand,
    context: VariableContext
  ): Promise<BMadResult> {
    try {
      // Load TOML command definition
      const tomlCommand = await TOMLCommandLoader.getCommand(
        command.module,
        'workflows',
        command.name
      );

      if (!tomlCommand) {
        return {
          success: false,
          error: `Workflow not found: ${command.module}:${command.name}`,
          bmadDetails: {
            command: command.originalInput,
            phase: 'workflow-loading',
            originalError: `Workflow not found in .gemini/commands/`,
          },
        };
      }

      // Resolve variables in prompt
      const resolvedPrompt = await VariableResolver.resolve(tomlCommand.prompt, context);
      
      logger.info('Workflow command loaded', {
        workflowPath: tomlCommand.filePath,
        promptLength: resolvedPrompt.length,
      });

      // Return the resolved prompt for execution
      return {
        success: true,
        data: {
          type: 'workflow',
          prompt: resolvedPrompt,
          command: tomlCommand,
          context,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        bmadDetails: {
          command: command.originalInput,
          phase: 'workflow-execution',
          originalError: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Execute an agent command
   */
  private static async executeAgent(
    command: BMadCommand,
    context: VariableContext
  ): Promise<BMadResult> {
    try {
      // Load agent definition
      const agent = await GitHubAgentLoader.getAgent(
        command.module,
        command.name
      );

      if (!agent) {
        return {
          success: false,
          error: `Agent not found: ${command.module}:${command.name}`,
          bmadDetails: {
            command: command.originalInput,
            phase: 'agent-loading',
            originalError: `Agent not found in .github/agents/`,
          },
        };
      }

      // Get activation content
      const activationContent = GitHubAgentLoader.getAgentActivationContent(agent);
      const resolvedPrompt = await VariableResolver.resolve(activationContent, context);
      
      logger.info('Agent command loaded', {
        agentPath: agent.filePath,
        promptLength: resolvedPrompt.length,
      });

      // Return the resolved activation prompt for execution
      return {
        success: true,
        data: {
          type: 'agent',
          prompt: resolvedPrompt,
          agent,
          context,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to execute agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        bmadDetails: {
          command: command.originalInput,
          phase: 'agent-execution',
          originalError: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Execute a task command
   */
  private static async executeTask(
    command: BMadCommand,
    context: VariableContext
  ): Promise<BMadResult> {
    try {
      // Load TOML command definition (tasks are also defined as TOML)
      const tomlCommand = await TOMLCommandLoader.getCommand(
        command.module,
        'tasks',
        command.name
      );

      if (!tomlCommand) {
        return {
          success: false,
          error: `Task not found: ${command.module}:${command.name}`,
          bmadDetails: {
            command: command.originalInput,
            phase: 'task-loading',
            originalError: `Task not found in .gemini/commands/`,
          },
        };
      }

      // Resolve variables in prompt
      const resolvedPrompt = await VariableResolver.resolve(tomlCommand.prompt, context);
      
      logger.info('Task command loaded', {
        taskPath: tomlCommand.filePath,
        promptLength: resolvedPrompt.length,
      });

      // Return the resolved prompt for execution
      return {
        success: true,
        data: {
          type: 'task',
          prompt: resolvedPrompt,
          command: tomlCommand,
          context,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to execute task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        bmadDetails: {
          command: command.originalInput,
          phase: 'task-execution',
          originalError: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get help for all available commands
   */
  static async getHelp(): Promise<string> {
    try {
      const commands = await TOMLCommandLoader.loadAllCommands();
      const agents = await GitHubAgentLoader.loadAllAgents();

      let help = BMadParser.getHelp();
      
      help += '\n\nAvailable Commands:\n';
      
      // Group commands by module
      const commandsByModule: Record<string, string[]> = {};
      commands.forEach((command) => {
        if (!commandsByModule[command.module]) {
          commandsByModule[command.module] = [];
        }
        commandsByModule[command.module].push(
          `  /bmad:${command.module}:${command.type}:${command.name} - ${command.description}`
        );
      });

      // Group agents by module
      const agentsByModule: Record<string, string[]> = {};
      agents.forEach((agent) => {
        if (!agentsByModule[agent.module]) {
          agentsByModule[agent.module] = [];
        }
        agentsByModule[agent.module].push(
          `  /bmad:${agent.module}:agents:${agent.name} - ${agent.description}`
        );
      });

      // Display by module
      const moduleNames = ['core', 'bmm', 'bmb', 'cis'];
      for (const moduleName of moduleNames) {
        help += `\n${moduleName.toUpperCase()}:\n`;
        
        if (commandsByModule[moduleName]) {
          help += commandsByModule[moduleName].join('\n') + '\n';
        }
        
        if (agentsByModule[moduleName]) {
          help += agentsByModule[moduleName].join('\n') + '\n';
        }
      }

      return help;
    } catch (error) {
      logger.error('Failed to generate BMad help', error as Error);
      return BMadParser.getHelp();
    }
  }

  /**
   * Search for commands and agents
   */
  static async search(query: string): Promise<{
    commands: BMadCommandDefinition[];
    agents: BMadAgentDefinition[];
  }> {
    try {
      const commands = await TOMLCommandLoader.searchCommands(query);
      const agents = await GitHubAgentLoader.searchAgents(query);

      return { commands, agents };
    } catch (error) {
      logger.error('Failed to search BMad commands', error as Error, { query });
      return { commands: [], agents: [] };
    }
  }

  /**
   * Get system statistics
   */
  static async getStats(): Promise<{
    commands: any;
    agents: any;
  }> {
    try {
      const commandStats = TOMLCommandLoader.getCacheStats();
      const agentStats = GitHubAgentLoader.getCacheStats();

      return {
        commands: commandStats,
        agents: agentStats,
      };
    } catch (error) {
      logger.error('Failed to get BMad stats', error as Error);
      return {
        commands: { totalCommands: 0, commandsByModule: {}, commandsByType: {} },
        agents: { totalAgents: 0, agentsByModule: {} },
      };
    }
  }

  /**
   * Initialize the BMad system
   */
  static async initialize(): Promise<void> {
    try {
      await BMadSessionManager.initialize();
      await Promise.all([
        TOMLCommandLoader.loadAllCommands(),
        GitHubAgentLoader.loadAllAgents(),
      ]);
      
      logger.info('BMad system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize BMad system', error as Error);
      throw error;
    }
  }

  /**
   * Get session statistics for a user
   */
  static async getSessionStats(userId: string): Promise<{
    totalCommands: number;
    averageExecutionTime: number;
    topAgents: Record<string, number>;
    topModules: Record<string, number>;
  }> {
    try {
      return await BMadSessionManager.getSessionStats(userId);
    } catch (error) {
      logger.error('Failed to get BMad session stats', error as Error, { userId });
      return {
        totalCommands: 0,
        averageExecutionTime: 0,
        topAgents: {},
        topModules: {},
      };
    }
  }

  /**
   * Create an anonymous session
   */
  static async createAnonymousSession(): Promise<any> {
    try {
      return await BMadSessionManager.createAnonymousSession();
    } catch (error) {
      logger.error('Failed to create anonymous BMad session', error as Error);
      throw error;
    }
  }

  /**
   * Get session history for a user
   */
  static async getSessionHistory(userId: string, limit?: number): Promise<any[]> {
    try {
      return await BMadSessionManager.getSessionHistory(userId, limit);
    } catch (error) {
      logger.error('Failed to get BMad session history', error as Error, { userId });
      return [];
    }
  }
}