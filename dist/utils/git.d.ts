/**
 * Initialize git repository
 */
export declare function initGit(targetPath: string): Promise<void>;
/**
 * Create initial commit
 */
export declare function createInitialCommit(targetPath: string, message: string): Promise<void>;
/**
 * Generate .gitignore content
 */
export declare function generateGitignore(options: {
    isNode?: boolean;
    hasEnv?: boolean;
    hasPrisma?: boolean;
    hasNextJs?: boolean;
}): string;
/**
 * Write .gitignore file
 */
export declare function writeGitignore(targetPath: string, options: {
    isNode?: boolean;
    hasEnv?: boolean;
    hasPrisma?: boolean;
    hasNextJs?: boolean;
}): Promise<void>;
//# sourceMappingURL=git.d.ts.map