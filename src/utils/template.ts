// ============================================
// Template Utilities
// ============================================

import type { ProjectConfig, TemplateContext } from '../types/index.js';

/**
 * Create template context from project config
 */
export function createTemplateContext(config: ProjectConfig): TemplateContext {
  return {
    projectName: config.projectName,
    description: config.description,
    backendFramework: config.backend.framework,
    frontendFramework: config.frontend.framework,
    database: config.backend.database,
    orm: config.backend.orm,
    auth: config.backend.auth,
    language: config.backend.language,
    packageManager: config.packageManager,
    isMonorepo: config.structure === 'monorepo',
    hasDocker: config.docker,
    backendPort: config.backend.port,
    frontendPort: config.frontend.port,
  };
}

/**
 * Simple template interpolation
 * Replaces {{variableName}} with context values
 */
export function interpolate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = context[key];
    return value !== undefined ? String(value) : '';
  });
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to CONSTANT_CASE
 */
export function toConstantCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}
