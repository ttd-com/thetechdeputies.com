/**
 * BMad Interface Definitions
 * Core types and interfaces for BMad system
 */

export interface BMadCommand {
  id: string;
  command: string;
  userId?: string;
  timestamp: Date;
  agent?: string;
  module?: string;
  executionTime?: number;
  result?: string;
}

export interface BMadResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

export interface BMadCommandDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
  examples: string[];
}

export interface BMadAgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export interface VariableContext {
  variables: Record<string, any>;
  parent?: VariableContext;
}

export interface BMadSession {
  id: string;
  userId: string;
  commands: BMadCommand[];
  createdAt: Date;
  lastActivity?: Date;
}

export interface CommandHistoryProps {
  userId: string;
  maxEntries?: number;
}

export interface CommandEntry {
  id: string;
  command: string;
  timestamp: Date;
  executionTime?: number;
  agent?: string;
  module?: string;
}