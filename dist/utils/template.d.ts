import type { ProjectConfig, TemplateContext } from '../types/index.js';
/**
 * Create template context from project config
 */
export declare function createTemplateContext(config: ProjectConfig): TemplateContext;
/**
 * Simple template interpolation
 * Replaces {{variableName}} with context values
 */
export declare function interpolate(template: string, context: Record<string, unknown>): string;
/**
 * Convert string to PascalCase
 */
export declare function toPascalCase(str: string): string;
/**
 * Convert string to camelCase
 */
export declare function toCamelCase(str: string): string;
/**
 * Convert string to kebab-case
 */
export declare function toKebabCase(str: string): string;
/**
 * Convert string to CONSTANT_CASE
 */
export declare function toConstantCase(str: string): string;
//# sourceMappingURL=template.d.ts.map