"use strict";
// ============================================
// Template Utilities
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplateContext = createTemplateContext;
exports.interpolate = interpolate;
exports.toPascalCase = toPascalCase;
exports.toCamelCase = toCamelCase;
exports.toKebabCase = toKebabCase;
exports.toConstantCase = toConstantCase;
/**
 * Create template context from project config
 */
function createTemplateContext(config) {
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
function interpolate(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = context[key];
        return value !== undefined ? String(value) : '';
    });
}
/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
    return str
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
/**
 * Convert string to camelCase
 */
function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
/**
 * Convert string to CONSTANT_CASE
 */
function toConstantCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toUpperCase();
}
//# sourceMappingURL=template.js.map