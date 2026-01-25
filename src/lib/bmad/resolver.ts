/**
 * BMad Variable Resolution System
 * 
 * Handles variable substitution for BMad commands and workflows
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { VariableContext } from './types';
import { logger } from '@/lib/logger';

export class VariableResolver {
  /**
   * Resolve variables in a string using provided context
   */
  static async resolve(
    input: string, 
    context: VariableContext
  ): Promise<string> {
    try {
      let resolved = input;

      // Resolve system variables first
      resolved = this.resolveSystemVariables(resolved, context);

      // Resolve config source variables
      resolved = await this.resolveConfigVariables(resolved, context);

      // Resolve template variables (handlebars-style)
      resolved = this.resolveTemplateVariables(resolved, context);

      // Resolve path variables
      resolved = this.resolvePathVariables(resolved, context);

      return resolved;
    } catch (error) {
      logger.error('Variable resolution failed', error as Error, { input });
      return input; // Return original if resolution fails
    }
  }

  /**
   * Resolve system variables like {project-root}, {installed_path}
   */
  private static resolveSystemVariables(
    input: string, 
    context: VariableContext
  ): string {
    let resolved = input;

    // {project-root} - Root directory of the project
    resolved = resolved.replace(/\{project-root\}/g, context.projectRoot);

    // {installed_path} - BMad module installation path
    if (context.installedPath) {
      resolved = resolved.replace(/\{installed_path\}/g, context.installedPath);
    }

    // {config_source} - Module configuration file path
    if (context.configSource) {
      resolved = resolved.replace(/\{config_source\}/g, context.configSource);
    }

    return resolved;
  }

  /**
   * Resolve config source variables like {config_source}:field_name
   */
  private static async resolveConfigVariables(
    input: string, 
    context: VariableContext
  ): Promise<string> {
    if (!context.configSource) {
      return input;
    }

    const configVarRegex = /\{config_source\}:([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let resolved = input;

    const matches = [...input.matchAll(configVarRegex)];
    
    for (const match of matches) {
      const fullMatch = match[0];
      const fieldPath = match[1];
      
      try {
        const config = await this.loadConfigFile(context.configSource!);
        const value = this.getNestedValue(config, fieldPath);
        
        if (value !== undefined) {
          const escapedPattern = fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          resolved = resolved.replace(new RegExp(escapedPattern, 'g'), String(value));
        }
      } catch (error) {
        logger.warn('Failed to resolve config variable', { 
          variable: fullMatch, 
          configSource: context.configSource,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return resolved;
  }

  /**
   * Resolve template variables like {{variable_name}}
   */
  private static resolveTemplateVariables(
    input: string, 
    context: VariableContext
  ): string {
    let resolved = input;

    // Simple template variable resolution
    const templateVarRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    
    resolved = resolved.replace(templateVarRegex, (match, varName) => {
      const value = this.getNestedValue(context, varName);
      return value !== undefined ? String(value) : match;
    });

    // Date variable
    resolved = resolved.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0]);
    resolved = resolved.replace(/\{\{datetime\}\}/g, new Date().toISOString());

    // User variables
    if (context.user) {
      resolved = resolved.replace(/\{\{user_name\}\}/g, context.user.name || '');
      resolved = resolved.replace(/\{\{user_email\}\}/g, context.user.email || '');
      resolved = resolved.replace(/\{\{user_id\}\}/g, context.user.id || '');
      resolved = resolved.replace(/\{\{user_role\}\}/g, context.user.role || '');
    }

    return resolved;
  }

  /**
   * Resolve path variables and normalize paths
   */
  private static resolvePathVariables(
    input: string, 
    context: VariableContext
  ): string {
    let resolved = input;

    // Handle relative paths
    if (!path.isAbsolute(resolved)) {
      // If the path starts with a variable, resolve that first
      if (resolved.startsWith('{')) {
        // This will be handled by variable resolution above
        const afterVar = resolved.replace(/^[^{]*\}/, '');
        const varPart = resolved.substring(0, resolved.length - afterVar.length);
        resolved = varPart + afterVar;
      } else {
        // Make relative paths absolute to project root
        resolved = path.join(context.projectRoot, resolved);
      }
    }

    // Normalize path separators
    resolved = resolved.replace(/\\/g, '/');

    return resolved;
  }

  /**
   * Load configuration file (YAML)
   */
  private static async loadConfigFile(configPath: string): Promise<any> {
    try {
      const fullPath = path.isAbsolute(configPath) 
        ? configPath 
        : path.join(process.cwd(), configPath);

      const content = await fs.readFile(fullPath, 'utf-8');
      return yaml.load(content);
    } catch (error) {
      logger.error('Failed to load config file', error as Error, { configPath });
      return {};
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  /**
   * Create variable context from session and command
   */
  static createContext(
    session?: any,
    command?: any
  ): VariableContext {
    return {
      projectRoot: process.cwd(),
      installedPath: command?.installedPath,
      configSource: command?.configSource,
      user: session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      } : undefined,
    };
  }

  /**
   * Validate that all variables in a string can be resolved
   */
  static async validateVariables(
    input: string, 
    context: VariableContext
  ): Promise<{
    isValid: boolean;
    unresolvedVariables: string[];
  }> {
    const resolved = await this.resolve(input, context);
    const unresolvedVariables: string[] = [];

    // Check for unresolved variables
    const varPatterns = [
      /\{project-root\}/g,
      /\{installed_path\}/g,
      /\{config_source\}:[a-zA-Z_][a-zA-Z0-9_]*/g,
      /\{config_source\}/g,
      /\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/g,
    ];

    for (const pattern of varPatterns) {
      const matches = resolved.match(pattern);
      if (matches) {
        unresolvedVariables.push(...matches);
      }
    }

    // Remove duplicates
    const uniqueUnresolved = [...new Set(unresolvedVariables)];

    return {
      isValid: uniqueUnresolved.length === 0,
      unresolvedVariables: uniqueUnresolved,
    };
  }

  /**
   * Get list of all variables used in a string
   */
  static extractVariables(input: string): {
    systemVars: string[];
    configVars: string[];
    templateVars: string[];
  } {
    const systemVars = [
      ...(input.match(/\{project-root\}/g) || []),
      ...(input.match(/\{installed_path\}/g) || []),
      ...(input.match(/\{config_source\}/g) || []),
    ];

    const configVars = [
      ...(input.match(/\{config_source\}:[a-zA-Z_][a-zA-Z0-9_]*/g) || []),
    ];

    const templateVars = [
      ...(input.match(/\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/g) || []),
    ];

    return {
      systemVars: [...new Set(systemVars)],
      configVars: [...new Set(configVars)],
      templateVars: [...new Set(templateVars)],
    };
  }
}