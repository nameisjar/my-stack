// ============================================
// Logger Utilities
// ============================================

import chalk from 'chalk';
import ora, { type Ora } from 'ora';

/**
 * Log success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Log error message
 */
export function error(message: string): void {
  console.log(chalk.red('✗'), message);
}

/**
 * Log warning message
 */
export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Log info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log debug message
 */
export function debug(message: string): void {
  if (process.env.DEBUG) {
    console.log(chalk.gray('🔍'), message);
  }
}

/**
 * Create a spinner
 */
export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
  });
}

/**
 * Log a step in the process
 */
export function step(stepNumber: number, totalSteps: number, message: string): void {
  const progress = chalk.gray(`[${stepNumber}/${totalSteps}]`);
  console.log(`\n${progress} ${chalk.cyan(message)}`);
}

/**
 * Log a section header
 */
export function section(title: string): void {
  console.log();
  console.log(chalk.cyan('─'.repeat(50)));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan('─'.repeat(50)));
}

/**
 * Log completion message with next steps
 */
export function complete(projectName: string, pm: string): void {
  const runCmd = pm === 'npm' ? 'npm run' : pm;

  console.log();
  console.log(chalk.green('═'.repeat(50)));
  console.log(chalk.green.bold('  🎉 Project created successfully!'));
  console.log(chalk.green('═'.repeat(50)));
  console.log();
  console.log(chalk.white('  Next steps:'));
  console.log();
  console.log(chalk.gray('    $'), chalk.cyan(`cd ${projectName}`));
  console.log(chalk.gray('    $'), chalk.cyan(`${pm} install`));
  console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} dev`));
  console.log();
  console.log(chalk.gray('  For more info, check the README.md file'));
  console.log();
}
