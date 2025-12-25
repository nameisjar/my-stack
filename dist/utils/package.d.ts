import type { PackageManager } from '../types/index.js';
/**
 * Get install command for package manager
 */
export declare function getInstallCommand(pm: PackageManager): string;
/**
 * Get add package command
 */
export declare function getAddCommand(pm: PackageManager, isDev?: boolean): string;
/**
 * Get run script command
 */
export declare function getRunCommand(pm: PackageManager): string;
/**
 * Get exec command (for running bin scripts)
 */
export declare function getExecCommand(pm: PackageManager): string;
/**
 * Install dependencies
 */
export declare function installDependencies(targetPath: string, pm: PackageManager): Promise<void>;
/**
 * Generate package.json scripts section
 */
export declare function generateScripts(options: {
    isBackend?: boolean;
    isFrontend?: boolean;
    isMonorepo?: boolean;
    framework?: string;
    pm: PackageManager;
}): Record<string, string>;
/**
 * Get lock file name for package manager
 */
export declare function getLockFileName(pm: PackageManager): string;
//# sourceMappingURL=package.d.ts.map