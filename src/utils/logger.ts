// ============================================
// Logger Utilities
// ============================================

import chalk from 'chalk';
import ora, { type Ora } from 'ora';

// Simplified config type for completion message
export interface CompletionConfig {
  projectName: string;
  projectStructure: 'monorepo' | 'separate';
  backend?: {
    framework?: string;
    database?: string;
    orm?: string;
    mailing?: string;
    port?: number;
  };
  frontend?: {
    framework?: string;
  };
}

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
export function complete(projectName: string, pm: string, config?: CompletionConfig): void {
  const runCmd = pm === 'npm' ? 'npm run' : pm;
  const isMonorepo = config?.projectStructure === 'monorepo';
  const hasPrisma = config?.backend?.database === 'prisma' || config?.backend?.orm === 'prisma';
  const hasMailing = config?.backend?.mailing && config.backend.mailing !== 'none';
  const hasBackend = config?.backend?.framework && config.backend.framework !== 'none';
  const hasFrontend = config?.frontend?.framework && config.frontend.framework !== 'none';

  console.log();
  console.log(chalk.green('═'.repeat(60)));
  console.log(chalk.green.bold('  🎉 Project created successfully!'));
  console.log(chalk.green('═'.repeat(60)));
  console.log();
  
  // Navigate to project
  console.log(chalk.white.bold('  📁 Navigate to your project:'));
  console.log();
  console.log(chalk.gray('    $'), chalk.cyan(`cd ${projectName}`));
  console.log();

  if (isMonorepo) {
    // ================== MONOREPO INSTRUCTIONS ==================
    console.log(chalk.white.bold('  📦 Install dependencies (from root):'));
    console.log();
    console.log(chalk.gray('    $'), chalk.cyan(`${pm} install`));
    console.log();

    if (hasPrisma && hasBackend) {
      console.log(chalk.white.bold('  🗄️  Setup Database:'));
      console.log();
      console.log(chalk.gray('    # Navigate to backend'));
      console.log(chalk.gray('    $'), chalk.cyan('cd apps/backend'));
      console.log();
      console.log(chalk.gray('    # Create .env file with your database URL'));
      console.log(chalk.gray('    $'), chalk.cyan('cp .env.example .env'));
      console.log(chalk.gray('    # Edit .env and set DATABASE_URL'));
      console.log();
      console.log(chalk.gray('    # Generate Prisma Client'));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} prisma:generate`));
      console.log();
      console.log(chalk.gray('    # Run migrations (creates tables)'));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} prisma:migrate`));
      console.log();
      console.log(chalk.gray('    # (Optional) Open Prisma Studio'));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} prisma:studio`));
      console.log();
      console.log(chalk.gray('    # Go back to root'));
      console.log(chalk.gray('    $'), chalk.cyan('cd ../..'));
      console.log();
    }

    if (hasMailing && hasBackend) {
      console.log(chalk.white.bold('  📧 Setup Mailing:'));
      console.log();
      if (config?.backend?.mailing === 'resend') {
        console.log(chalk.gray('    # Add RESEND_API_KEY to apps/backend/.env'));
        console.log(chalk.gray('    # Get your API key from https://resend.com'));
      } else {
        console.log(chalk.gray('    # Add SMTP credentials to apps/backend/.env:'));
        console.log(chalk.gray('    # SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'));
      }
      console.log();
    }

    console.log(chalk.white.bold('  🚀 Start Development:'));
    console.log();
    console.log(chalk.gray('    # Run all apps from root'));
    console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} dev`));
    console.log();
    if (hasBackend && hasFrontend) {
      console.log(chalk.gray('    # Or run separately:'));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} dev:backend`));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} dev:frontend`));
      console.log();
    }

  } else {
    // ================== SEPARATE REPOS INSTRUCTIONS ==================
    
    if (hasBackend) {
      console.log(chalk.white.bold('  🔧 Backend Setup:'));
      console.log();
      console.log(chalk.gray('    $'), chalk.cyan('cd backend'));
      console.log(chalk.gray('    $'), chalk.cyan(`${pm} install`));
      console.log();

      if (hasPrisma) {
        console.log(chalk.gray('    # Create .env file with your database URL'));
        console.log(chalk.gray('    $'), chalk.cyan('cp .env.example .env'));
        console.log(chalk.gray('    # Edit .env and set DATABASE_URL'));
        console.log();
        console.log(chalk.gray('    # Generate Prisma Client'));
        console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} prisma:generate`));
        console.log();
        console.log(chalk.gray('    # Run migrations (creates tables)'));
        console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} prisma:migrate`));
        console.log();
        console.log(chalk.gray('    # (Optional) Open Prisma Studio'));
        console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} prisma:studio`));
        console.log();
      }

      if (hasMailing) {
        console.log(chalk.white.bold('    📧 Setup Mailing:'));
        if (config?.backend?.mailing === 'resend') {
          console.log(chalk.gray('    # Add RESEND_API_KEY to .env'));
          console.log(chalk.gray('    # Get your API key from https://resend.com'));
        } else {
          console.log(chalk.gray('    # Add SMTP credentials to .env:'));
          console.log(chalk.gray('    # SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'));
        }
        console.log();
      }

      console.log(chalk.gray('    # Start backend server'));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} dev`));
      console.log();
      console.log(chalk.gray('    $'), chalk.cyan('cd ..'));
      console.log();
    }

    if (hasFrontend) {
      console.log(chalk.white.bold('  🎨 Frontend Setup:'));
      console.log();
      console.log(chalk.gray('    $'), chalk.cyan('cd frontend'));
      console.log(chalk.gray('    $'), chalk.cyan(`${pm} install`));
      console.log(chalk.gray('    $'), chalk.cyan(`${runCmd} dev`));
      console.log();
    }
  }

  // Show URLs
  console.log(chalk.white.bold('  🌐 Default URLs:'));
  console.log();
  if (hasFrontend) {
    const frontendPort = config?.frontend?.framework === 'nextjs' ? '3000' : 
                        config?.frontend?.framework === 'vue' ? '5173' : '5173';
    console.log(chalk.gray('    Frontend:'), chalk.cyan(`http://localhost:${frontendPort}`));
  }
  if (hasBackend) {
    const backendPort = config?.backend?.framework === 'nestjs' ? '3000' : 
                       config?.backend?.framework === 'fastify' ? '3000' : '3000';
    const actualPort = hasFrontend ? '3001' : backendPort;
    console.log(chalk.gray('    Backend: '), chalk.cyan(`http://localhost:${actualPort}`));
  }
  console.log();

  // Environment variables reminder
  if (hasPrisma || hasMailing) {
    console.log(chalk.yellow.bold('  ⚠️  Important:'));
    console.log();
    console.log(chalk.yellow('    Don\'t forget to configure your .env file!'));
    if (hasPrisma) {
      console.log(chalk.gray('    - DATABASE_URL (required for Prisma)'));
    }
    if (hasMailing) {
      if (config?.backend?.mailing === 'resend') {
        console.log(chalk.gray('    - RESEND_API_KEY (required for email)'));
      } else {
        console.log(chalk.gray('    - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'));
      }
    }
    console.log();
  }

  console.log(chalk.gray('  📖 For more info, check the README.md file'));
  console.log();
  console.log(chalk.green('═'.repeat(60)));
  console.log();
}
