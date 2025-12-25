"use strict";
// ============================================
// Logger Utilities
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.debug = debug;
exports.createSpinner = createSpinner;
exports.step = step;
exports.section = section;
exports.complete = complete;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
/**
 * Log success message
 */
function success(message) {
    console.log(chalk_1.default.green('✓'), message);
}
/**
 * Log error message
 */
function error(message) {
    console.log(chalk_1.default.red('✗'), message);
}
/**
 * Log warning message
 */
function warn(message) {
    console.log(chalk_1.default.yellow('⚠'), message);
}
/**
 * Log info message
 */
function info(message) {
    console.log(chalk_1.default.blue('ℹ'), message);
}
/**
 * Log debug message
 */
function debug(message) {
    if (process.env.DEBUG) {
        console.log(chalk_1.default.gray('🔍'), message);
    }
}
/**
 * Create a spinner
 */
function createSpinner(text) {
    return (0, ora_1.default)({
        text,
        color: 'cyan',
    });
}
/**
 * Log a step in the process
 */
function step(stepNumber, totalSteps, message) {
    const progress = chalk_1.default.gray(`[${stepNumber}/${totalSteps}]`);
    console.log(`\n${progress} ${chalk_1.default.cyan(message)}`);
}
/**
 * Log a section header
 */
function section(title) {
    console.log();
    console.log(chalk_1.default.cyan('─'.repeat(50)));
    console.log(chalk_1.default.cyan.bold(`  ${title}`));
    console.log(chalk_1.default.cyan('─'.repeat(50)));
}
/**
 * Log completion message with next steps
 */
function complete(projectName, pm) {
    const runCmd = pm === 'npm' ? 'npm run' : pm;
    console.log();
    console.log(chalk_1.default.green('═'.repeat(50)));
    console.log(chalk_1.default.green.bold('  🎉 Project created successfully!'));
    console.log(chalk_1.default.green('═'.repeat(50)));
    console.log();
    console.log(chalk_1.default.white('  Next steps:'));
    console.log();
    console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`cd ${projectName}`));
    console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${pm} install`));
    console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} dev`));
    console.log();
    console.log(chalk_1.default.gray('  For more info, check the README.md file'));
    console.log();
}
//# sourceMappingURL=logger.js.map