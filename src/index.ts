#!/usr/bin/env node

// ============================================
// CLI Entry Point
// create-my-stack - Fullstack Boilerplate Generator
// ============================================

import { Command } from 'commander';
import chalk from 'chalk';
import { runPrompts, showSummary, confirmGeneration } from './prompts/index.js';
import { ProjectOrchestrator } from './core/index.js';
import { complete, error } from './utils/index.js';

const program = new Command();

program
  .name('create-my-stack')
  .description('🚀 CLI Generator untuk Fullstack Boilerplate')
  .version('1.0.0')
  .option('-y, --yes', 'Skip confirmation prompt')
  .option('--skip-install', 'Skip dependency installation')
  .action(async (options) => {
    try {
      // Run interactive prompts
      const config = await runPrompts();

      // Show summary
      showSummary(config);

      // Confirm generation (unless --yes flag)
      if (!options.yes) {
        const confirmed = await confirmGeneration();
        if (!confirmed) {
          console.log(chalk.yellow('\n👋 Generation cancelled. Goodbye!'));
          process.exit(0);
        }
      }

      console.log(); // Empty line before generation

      // Generate project
      const orchestrator = new ProjectOrchestrator(config);
      await orchestrator.generate();

      // Show completion message
      complete(config.projectName, config.packageManager);
    } catch (err) {
      if (err instanceof Error) {
        error(err.message);
        if (process.env.DEBUG) {
          console.error(err.stack);
        }
      } else {
        error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

// Quick templates command
program
  .command('template <name>')
  .description('Generate from a predefined template')
  .option('-o, --output <dir>', 'Output directory', '.')
  .action(async (name, options) => {
    console.log(chalk.cyan(`\n📦 Generating from template: ${name}\n`));
    
    // Template presets
    const templates: Record<string, () => Promise<void>> = {
      'express-vue': async () => {
        console.log('Express + Vue 3 + Tailwind + Prisma');
        // TODO: Implement preset logic
      },
      'express-react': async () => {
        console.log('Express + React + Tailwind + Prisma');
      },
      'nestjs-nextjs': async () => {
        console.log('NestJS + Next.js + Tailwind + Prisma');
      },
      'fastify-vue': async () => {
        console.log('Fastify + Vue 3 + Tailwind + Prisma');
      },
    };

    const template = templates[name];
    if (!template) {
      error(`Unknown template: ${name}`);
      console.log(chalk.yellow('\nAvailable templates:'));
      Object.keys(templates).forEach((t) => {
        console.log(chalk.gray(`  - ${t}`));
      });
      process.exit(1);
    }

    await template();
  });

// List available options
program
  .command('list')
  .description('List all available options')
  .action(() => {
    console.log(chalk.cyan('\n📋 Available Options\n'));

    console.log(chalk.yellow('Backend Frameworks:'));
    console.log('  • Express.js - Minimal & flexible');
    console.log('  • Fastify - Fast & low overhead');
    console.log('  • NestJS - Progressive TypeScript framework');

    console.log(chalk.yellow('\nFrontend Frameworks:'));
    console.log('  • Vue 3 - Progressive framework');
    console.log('  • React - Library for UIs');
    console.log('  • Next.js - React with SSR');

    console.log(chalk.yellow('\nDatabases:'));
    console.log('  • PostgreSQL');
    console.log('  • MySQL');
    console.log('  • MongoDB');
    console.log('  • SQLite');

    console.log(chalk.yellow('\nORMs:'));
    console.log('  • Prisma - Modern TypeScript ORM');
    console.log('  • Sequelize - Promise-based ORM');
    console.log('  • Mongoose - MongoDB ODM');

    console.log(chalk.yellow('\nAuthentication:'));
    console.log('  • JWT - JSON Web Token');
    console.log('  • Session - Server-side sessions');

    console.log(chalk.yellow('\nStyling:'));
    console.log('  • Tailwind CSS');
    console.log('  • Plain CSS');
    console.log('  • SCSS/Sass');

    console.log(chalk.yellow('\nState Management:'));
    console.log('  • Pinia (Vue)');
    console.log('  • Redux Toolkit (React)');
    console.log('  • Zustand (React)');

    console.log();
  });

program.parse();
