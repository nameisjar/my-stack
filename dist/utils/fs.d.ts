/**
 * Ensure directory exists, create if not
 */
export declare function ensureDir(dirPath: string): Promise<void>;
/**
 * Write file with content
 */
export declare function writeFile(filePath: string, content: string): Promise<void>;
/**
 * Write JSON file
 */
export declare function writeJsonFile(filePath: string, data: object): Promise<void>;
/**
 * Copy file or directory
 */
export declare function copyPath(src: string, dest: string): Promise<void>;
/**
 * Check if path exists
 */
export declare function pathExists(targetPath: string): Promise<boolean>;
/**
 * Remove file or directory
 */
export declare function removePath(targetPath: string): Promise<void>;
/**
 * Read file content
 */
export declare function readFile(filePath: string): Promise<string>;
/**
 * Create multiple directories
 */
export declare function createDirectories(basePath: string, dirs: string[]): Promise<void>;
/**
 * Write multiple files
 */
export declare function writeFiles(files: Array<{
    path: string;
    content: string;
}>): Promise<void>;
//# sourceMappingURL=fs.d.ts.map