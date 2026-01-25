/**
 * BMad Command System Types
 * 
 * Type definitions for the BMad command parser and execution system
 */

export interface BMadCommand {
  module: 'core' | 'bmm' | 'bmb' | 'cis';
  type: 'workflows' | 'agents' | 'tasks';
  name: string;
  parameters?: Record<string, any>;
  originalInput: string;
}

export interface BMadResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  bmadDetails?: {
    command: string;
    phase?: string;
    originalError?: string;
    executionTime?: number;
  };
  executionTime?: number;
}

export interface BMadCommandDefinition {
  name: string;
  description: string;
  type: 'workflow' | 'agent' | 'task';
  module: 'core' | 'bmm' | 'bmb' | 'cis';
  prompt: string;
  filePath: string;
}

export interface BMadAgentDefinition {
  name: string;
  description: string;
  module: 'core' | 'bmm' | 'bmb' | 'cis';
  content: string;
  filePath: string;
}

export interface VariableContext {
  projectRoot: string;
  installedPath?: string;
  configSource?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  [key: string]: any;
}

export interface ParsedTOMLCommand {
  description: string;
  prompt: string;
  metadata: {
    type: 'workflow' | 'agent' | 'task';
    module: 'core' | 'bmm' | 'bmb' | 'cis';
    name: string;
  };
}