#!/usr/bin/env node
"use strict";
// ============================================
// CLI Entry Point
// create-my-stack - Fullstack Boilerplate Generator
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const index_js_1 = require("./prompts/index.js");
const index_js_2 = require("./core/index.js");
const index_js_3 = require("./utils/index.js");
const program = new commander_1.Command();
program
    .name('create-my-stack')
    .description('🚀 CLI Generator untuk Fullstack Boilerplate')
    .version('1.0.0')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (options) => {
    try {
        // Run interactive prompts
        const config = await (0, index_js_1.runPrompts)();
        // Show summary
        (0, index_js_1.showSummary)(config);
        // Confirm generation (unless --yes flag)
        if (!options.yes) {
            const confirmed = await (0, index_js_1.confirmGeneration)();
            if (!confirmed) {
                console.log(chalk_1.default.yellow('\n👋 Generation cancelled. Goodbye!'));
                process.exit(0);
            }
        }
        console.log(); // Empty line before generation
        // Generate project
        const orchestrator = new index_js_2.ProjectOrchestrator(config);
        await orchestrator.generate();
        // Show completion message
        (0, index_js_3.complete)(config.projectName, config.packageManager);
    }
    catch (err) {
        if (err instanceof Error) {
            (0, index_js_3.error)(err.message);
            if (process.env.DEBUG) {
                console.error(err.stack);
            }
        }
        else {
            (0, index_js_3.error)('An unexpected error occurred');
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
    console.log(chalk_1.default.cyan(`\n📦 Generating from template: ${name}\n`));
    // Template presets
    const templates = {
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
        (0, index_js_3.error)(`Unknown template: ${name}`);
        console.log(chalk_1.default.yellow('\nAvailable templates:'));
        Object.keys(templates).forEach((t) => {
            console.log(chalk_1.default.gray(`  - ${t}`));
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
    console.log(chalk_1.default.cyan('\n📋 Available Options\n'));
    console.log(chalk_1.default.yellow('Backend Frameworks:'));
    console.log('  • Express.js - Minimal & flexible');
    console.log('  • Fastify - Fast & low overhead');
    console.log('  • NestJS - Progressive TypeScript framework');
    console.log(chalk_1.default.yellow('\nFrontend Frameworks:'));
    console.log('  • Vue 3 - Progressive framework');
    console.log('  • React - Library for UIs');
    console.log('  • Next.js - React with SSR');
    console.log(chalk_1.default.yellow('\nDatabases:'));
    console.log('  • PostgreSQL');
    console.log('  • MySQL');
    console.log('  • MongoDB');
    console.log('  • SQLite');
    console.log(chalk_1.default.yellow('\nORMs:'));
    console.log('  • Prisma - Modern TypeScript ORM');
    console.log('  • Sequelize - Promise-based ORM');
    console.log('  • Mongoose - MongoDB ODM');
    console.log(chalk_1.default.yellow('\nAuthentication:'));
    console.log('  • JWT - JSON Web Token');
    console.log('  • Session - Server-side sessions');
    console.log(chalk_1.default.yellow('\nStyling:'));
    console.log('  • Tailwind CSS');
    console.log('  • Plain CSS');
    console.log('  • SCSS/Sass');
    console.log(chalk_1.default.yellow('\nState Management:'));
    console.log('  • Pinia (Vue)');
    console.log('  • Redux Toolkit (React)');
    console.log('  • Zustand (React)');
    console.log();
});
program.parse();
//# sourceMappingURL=index.js.map