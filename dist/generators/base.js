"use strict";
// ============================================
// Base Generator Class
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGenerator = void 0;
const index_js_1 = require("../utils/index.js");
class BaseGenerator {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Create standard folder structure
     */
    async createFolderStructure(basePath, folders) {
        await (0, index_js_1.createDirectories)(basePath, folders);
    }
    /**
     * Write a file relative to base path
     */
    async writeToFile(basePath, relativePath, content) {
        const fullPath = `${basePath}/${relativePath}`;
        await (0, index_js_1.writeFile)(fullPath, content);
    }
    /**
     * Write JSON file relative to base path
     */
    async writeToJsonFile(basePath, relativePath, data) {
        const fullPath = `${basePath}/${relativePath}`;
        await (0, index_js_1.writeJsonFile)(fullPath, data);
    }
    /**
     * Helper to get backend path
     */
    get backendPath() {
        return this.config.backendPath;
    }
    /**
     * Helper to get frontend path
     */
    get frontendPath() {
        return this.config.frontendPath;
    }
    /**
     * Helper to check if TypeScript
     */
    get isTypeScript() {
        return this.config.backend.language === 'typescript';
    }
    /**
     * Get file extension based on language
     */
    get ext() {
        return this.isTypeScript ? 'ts' : 'js';
    }
}
exports.BaseGenerator = BaseGenerator;
//# sourceMappingURL=base.js.map