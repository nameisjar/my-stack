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
function complete(projectName, pm, config) {
    const runCmd = pm === 'npm' ? 'npm run' : pm;
    const isMonorepo = config?.projectStructure === 'monorepo';
    const hasPrisma = config?.backend?.database === 'prisma' || config?.backend?.orm === 'prisma';
    const hasMailing = config?.backend?.mailing && config.backend.mailing !== 'none';
    const hasBackend = config?.backend?.framework && config.backend.framework !== 'none';
    const hasFrontend = config?.frontend?.framework && config.frontend.framework !== 'none';
    console.log();
    console.log(chalk_1.default.green('═'.repeat(60)));
    console.log(chalk_1.default.green.bold('  🎉 Project created successfully!'));
    console.log(chalk_1.default.green('═'.repeat(60)));
    console.log();
    // Navigate to project
    console.log(chalk_1.default.white.bold('  📁 Navigate to your project:'));
    console.log();
    console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`cd ${projectName}`));
    console.log();
    if (isMonorepo) {
        // ================== MONOREPO INSTRUCTIONS ==================
        console.log(chalk_1.default.white.bold('  📦 Install dependencies (from root):'));
        console.log();
        console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${pm} install`));
        console.log();
        if (hasPrisma && hasBackend) {
            console.log(chalk_1.default.white.bold('  🗄️  Setup Database:'));
            console.log();
            console.log(chalk_1.default.gray('    # Navigate to backend'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cd apps/backend'));
            console.log();
            console.log(chalk_1.default.gray('    # Create .env file with your database URL'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cp .env.example .env'));
            console.log(chalk_1.default.gray('    # Edit .env and set DATABASE_URL'));
            console.log();
            console.log(chalk_1.default.gray('    # Generate Prisma Client'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} prisma:generate`));
            console.log();
            console.log(chalk_1.default.gray('    # Run migrations (creates tables)'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} prisma:migrate`));
            console.log();
            console.log(chalk_1.default.gray('    # (Optional) Open Prisma Studio'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} prisma:studio`));
            console.log();
            console.log(chalk_1.default.gray('    # Go back to root'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cd ../..'));
            console.log();
        }
        if (hasMailing && hasBackend) {
            console.log(chalk_1.default.white.bold('  📧 Setup Mailing:'));
            console.log();
            if (config?.backend?.mailing === 'resend') {
                console.log(chalk_1.default.gray('    # Add RESEND_API_KEY to apps/backend/.env'));
                console.log(chalk_1.default.gray('    # Get your API key from https://resend.com'));
            }
            else {
                console.log(chalk_1.default.gray('    # Add SMTP credentials to apps/backend/.env:'));
                console.log(chalk_1.default.gray('    # SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'));
            }
            console.log();
        }
        console.log(chalk_1.default.white.bold('  🚀 Start Development:'));
        console.log();
        console.log(chalk_1.default.gray('    # Run all apps from root'));
        console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} dev`));
        console.log();
        if (hasBackend && hasFrontend) {
            console.log(chalk_1.default.gray('    # Or run separately:'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} dev:backend`));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} dev:frontend`));
            console.log();
        }
    }
    else {
        // ================== SEPARATE REPOS INSTRUCTIONS ==================
        if (hasBackend) {
            console.log(chalk_1.default.white.bold('  🔧 Backend Setup:'));
            console.log();
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cd backend'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${pm} install`));
            console.log();
            if (hasPrisma) {
                console.log(chalk_1.default.gray('    # Create .env file with your database URL'));
                console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cp .env.example .env'));
                console.log(chalk_1.default.gray('    # Edit .env and set DATABASE_URL'));
                console.log();
                console.log(chalk_1.default.gray('    # Generate Prisma Client'));
                console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} prisma:generate`));
                console.log();
                console.log(chalk_1.default.gray('    # Run migrations (creates tables)'));
                console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} prisma:migrate`));
                console.log();
                console.log(chalk_1.default.gray('    # (Optional) Open Prisma Studio'));
                console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} prisma:studio`));
                console.log();
            }
            if (hasMailing) {
                console.log(chalk_1.default.white.bold('    📧 Setup Mailing:'));
                if (config?.backend?.mailing === 'resend') {
                    console.log(chalk_1.default.gray('    # Add RESEND_API_KEY to .env'));
                    console.log(chalk_1.default.gray('    # Get your API key from https://resend.com'));
                }
                else {
                    console.log(chalk_1.default.gray('    # Add SMTP credentials to .env:'));
                    console.log(chalk_1.default.gray('    # SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'));
                }
                console.log();
            }
            console.log(chalk_1.default.gray('    # Start backend server'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} dev`));
            console.log();
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cd ..'));
            console.log();
        }
        if (hasFrontend) {
            console.log(chalk_1.default.white.bold('  🎨 Frontend Setup:'));
            console.log();
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan('cd frontend'));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${pm} install`));
            console.log(chalk_1.default.gray('    $'), chalk_1.default.cyan(`${runCmd} dev`));
            console.log();
        }
    }
    // Show URLs
    console.log(chalk_1.default.white.bold('  🌐 Default URLs:'));
    console.log();
    if (hasFrontend) {
        const frontendPort = config?.frontend?.framework === 'nextjs' ? '3000' :
            config?.frontend?.framework === 'vue' ? '5173' : '5173';
        console.log(chalk_1.default.gray('    Frontend:'), chalk_1.default.cyan(`http://localhost:${frontendPort}`));
    }
    if (hasBackend) {
        const backendPort = config?.backend?.framework === 'nestjs' ? '3000' :
            config?.backend?.framework === 'fastify' ? '3000' : '3000';
        const actualPort = hasFrontend ? '3001' : backendPort;
        console.log(chalk_1.default.gray('    Backend: '), chalk_1.default.cyan(`http://localhost:${actualPort}`));
    }
    console.log();
    // Environment variables reminder
    if (hasPrisma || hasMailing) {
        console.log(chalk_1.default.yellow.bold('  ⚠️  Important:'));
        console.log();
        console.log(chalk_1.default.yellow('    Don\'t forget to configure your .env file!'));
        if (hasPrisma) {
            console.log(chalk_1.default.gray('    - DATABASE_URL (required for Prisma)'));
        }
        if (hasMailing) {
            if (config?.backend?.mailing === 'resend') {
                console.log(chalk_1.default.gray('    - RESEND_API_KEY (required for email)'));
            }
            else {
                console.log(chalk_1.default.gray('    - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'));
            }
        }
        console.log();
    }
    console.log(chalk_1.default.gray('  📖 For more info, check the README.md file'));
    console.log();
    console.log(chalk_1.default.green('═'.repeat(60)));
    console.log();
}
//# sourceMappingURL=logger.js.map