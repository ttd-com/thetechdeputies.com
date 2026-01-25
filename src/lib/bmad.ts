/**
 * BMad Engine Core
 * Main command processing and execution engine
 */

import { BMadCommand, BMadResult, BMadCommandDefinition, BMadAgentDefinition, VariableContext } from './bmad/bmad-interface';

export class BMadEngine {
  private commands: Map<string, BMadCommandDefinition> = new Map();
  private agents: Map<string, BMadAgentDefinition> = new Map();
  private context: VariableContext = { variables: {} };

  constructor() {
    this.initializeCoreCommands();
  }

  private initializeCoreCommands() {
    // Core system commands would be initialized here
  console.log('BMad Engine initialized');
  }

  async executeCommand(command: string, userId?: string): Promise<BMadResult> {
    const startTime = Date.now();
    
    try {
      // Parse and execute command
      const result = await this.processCommand(command, userId);
      
      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  private async processCommand(command: string, userId?: string): Promise<any> {
    // Simple command processing for demonstration
    return `Command "${command}" executed successfully`;
  }

  registerCommand(definition: BMadCommandDefinition): void {
    this.commands.set(definition.name, definition);
  }

  registerAgent(agent: BMadAgentDefinition): void {
    this.agents.set(agent.name, agent);
  }

  setVariable(name: string, value: any): void {
    this.context.variables[name] = value;
  }

  getVariable(name: string): any {
    return this.context.variables[name];
  }

  getAvailableCommands(): BMadCommandDefinition[] {
    return Array.from(this.commands.values());
  }

  getAvailableAgents(): BMadAgentDefinition[] {
    return Array.from(this.agents.values());
  }
}