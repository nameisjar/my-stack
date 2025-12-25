import { type Ora } from 'ora';
/**
 * Log success message
 */
export declare function success(message: string): void;
/**
 * Log error message
 */
export declare function error(message: string): void;
/**
 * Log warning message
 */
export declare function warn(message: string): void;
/**
 * Log info message
 */
export declare function info(message: string): void;
/**
 * Log debug message
 */
export declare function debug(message: string): void;
/**
 * Create a spinner
 */
export declare function createSpinner(text: string): Ora;
/**
 * Log a step in the process
 */
export declare function step(stepNumber: number, totalSteps: number, message: string): void;
/**
 * Log a section header
 */
export declare function section(title: string): void;
/**
 * Log completion message with next steps
 */
export declare function complete(projectName: string, pm: string): void;
//# sourceMappingURL=logger.d.ts.map