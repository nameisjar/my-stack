import type { ProjectConfig, Generator } from '../types/index.js';
export declare abstract class BaseGenerator implements Generator {
    abstract name: string;
    protected config: ProjectConfig;
    constructor(config: ProjectConfig);
    abstract generate(): Promise<void>;
    /**
     * Create standard folder structure
     */
    protected createFolderStructure(basePath: string, folders: string[]): Promise<void>;
    /**
     * Write a file relative to base path
     */
    protected writeToFile(basePath: string, relativePath: string, content: string): Promise<void>;
    /**
     * Write JSON file relative to base path
     */
    protected writeToJsonFile(basePath: string, relativePath: string, data: object): Promise<void>;
    /**
     * Helper to get backend path
     */
    protected get backendPath(): string;
    /**
     * Helper to get frontend path
     */
    protected get frontendPath(): string;
    /**
     * Helper to check if TypeScript
     */
    protected get isTypeScript(): boolean;
    /**
     * Get file extension based on language
     */
    protected get ext(): string;
}
//# sourceMappingURL=base.d.ts.map