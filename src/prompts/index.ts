// ============================================
// Interactive Prompts untuk Stack Selection
// ============================================

import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import validatePackageName from 'validate-npm-package-name';
import type {
  ProjectConfig,
  BackendFramework,
  BackendLanguage,
  Database,
  ORM,
  AuthStrategy,
  MailingProvider,
  FrontendFramework,
  Styling,
  StateManagement,
  ProjectStructure,
  PackageManager,
} from '../types/index.js';
import {
  BACKEND_FRAMEWORKS,
  LANGUAGES,
  DATABASES,
  ORMS,
  AUTH_STRATEGIES,
  MAILING_PROVIDERS,
  FRONTEND_FRAMEWORKS,
  STYLING_OPTIONS,
  PACKAGE_MANAGERS,
  DEFAULT_BACKEND_PORT,
  DEFAULT_FRONTEND_PORT,
  getCompatibleORMs,
  getStateManagementOptions,
} from '../constants/index.js';

// Banner ASCII
export function showBanner(): void {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗      ║
║    ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝      ║
║    ██║     ██████╔╝█████╗  ███████║   ██║   █████╗        ║
║    ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝        ║
║    ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗      ║
║     ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝      ║
║                                                           ║
║           🚀 Fullstack Boilerplate Generator 🚀           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));
}

// Validate project name
function validateProjectName(input: string): boolean | string {
  if (!input.trim()) {
    return 'Project name is required';
  }

  const result = validatePackageName(input);
  if (!result.validForNewPackages) {
    const errors = [...(result.errors || []), ...(result.warnings || [])];
    return `Invalid package name: ${errors.join(', ')}`;
  }

  return true;
}

// Main Prompts
export async function runPrompts(): Promise<ProjectConfig> {
  showBanner();

  console.log(chalk.yellow('\n📦 Project Information\n'));

  // Project Info
  const projectInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-fullstack-app',
      validate: validateProjectName,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A fullstack application generated with create-my-stack',
    },
  ]);

  console.log(chalk.yellow('\n⚙️  Backend Configuration\n'));

  // Backend Config
  const backendConfig = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Backend framework:',
      choices: BACKEND_FRAMEWORKS.map((f) => ({
        name: `${f.name} - ${chalk.gray(f.description)}`,
        value: f.value,
      })),
    },
    {
      type: 'list',
      name: 'language',
      message: 'Language:',
      choices: LANGUAGES.map((l) => ({
        name: `${l.name} - ${chalk.gray(l.description)}`,
        value: l.value,
      })),
      when: (answers) => answers.framework !== 'nestjs', // NestJS is TypeScript only
    },
    {
      type: 'list',
      name: 'database',
      message: 'Database:',
      choices: DATABASES.map((d) => ({
        name: `${d.name} - ${chalk.gray(d.description)}`,
        value: d.value,
      })),
    },
    {
      type: 'list',
      name: 'orm',
      message: 'ORM/ODM:',
      choices: (answers) => {
        const compatibleORMs = getCompatibleORMs(answers.database);
        return ORMS.filter((o) => compatibleORMs.includes(o.value)).map((o) => ({
          name: `${o.name} - ${chalk.gray(o.description)}`,
          value: o.value,
        }));
      },
      when: (answers) => answers.database !== 'none',
    },
    {
      type: 'list',
      name: 'auth',
      message: 'Authentication:',
      choices: AUTH_STRATEGIES.map((a) => ({
        name: `${a.name} - ${chalk.gray(a.description)}`,
        value: a.value,
      })),
    },
    {
      type: 'list',
      name: 'mailing',
      message: 'Mailing provider:',
      choices: MAILING_PROVIDERS.map((m) => ({
        name: `${m.name} - ${chalk.gray(m.description)}`,
        value: m.value,
      })),
    },
    {
      type: 'number',
      name: 'port',
      message: 'Backend port:',
      default: DEFAULT_BACKEND_PORT,
    },
  ]);

  // NestJS forces TypeScript
  if (backendConfig.framework === 'nestjs') {
    backendConfig.language = 'typescript';
  }

  // No database = no ORM
  if (backendConfig.database === 'none') {
    backendConfig.orm = 'none';
  }

  console.log(chalk.yellow('\n🎨 Frontend Configuration\n'));

  // Frontend Config
  const frontendConfig = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Frontend framework:',
      choices: FRONTEND_FRAMEWORKS.map((f) => ({
        name: `${f.name} - ${chalk.gray(f.description)}`,
        value: f.value,
      })),
    },
    {
      type: 'list',
      name: 'styling',
      message: 'Styling:',
      choices: STYLING_OPTIONS.map((s) => ({
        name: `${s.name} - ${chalk.gray(s.description)}`,
        value: s.value,
      })),
      when: (answers) => answers.framework !== 'none',
    },
    {
      type: 'list',
      name: 'stateManagement',
      message: 'State management:',
      choices: (answers) => {
        const options = getStateManagementOptions(answers.framework);
        return options.map((s) => ({
          name: `${s.name}${s.description ? ` - ${chalk.gray(s.description)}` : ''}`,
          value: s.value,
        }));
      },
      when: (answers) => answers.framework !== 'none',
    },
    {
      type: 'number',
      name: 'port',
      message: 'Frontend dev server port:',
      default: DEFAULT_FRONTEND_PORT,
      when: (answers) => answers.framework !== 'none',
    },
  ]);

  // Defaults for backend-only
  if (frontendConfig.framework === 'none') {
    frontendConfig.styling = 'css';
    frontendConfig.stateManagement = 'none';
    frontendConfig.port = DEFAULT_FRONTEND_PORT;
  }

  console.log(chalk.yellow('\n📁 Project Structure\n'));

  // Project Structure
  const structureConfig = await inquirer.prompt([
    {
      type: 'list',
      name: 'structure',
      message: 'Project structure:',
      choices: [
        {
          name: `Monorepo - ${chalk.gray('Single repo with apps/ folder')}`,
          value: 'monorepo',
        },
        {
          name: `Separate repos - ${chalk.gray('Independent frontend & backend')}`,
          value: 'separate',
        },
      ],
      when: () => frontendConfig.framework !== 'none',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: PACKAGE_MANAGERS.map((p) => ({
        name: `${p.name} - ${chalk.gray(p.description)}`,
        value: p.value,
      })),
    },
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Initialize git repository?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'docker',
      message: 'Generate Docker configuration?',
      default: true,
    },
  ]);

  // Backend-only = no monorepo
  if (frontendConfig.framework === 'none') {
    structureConfig.structure = 'separate';
  }

  // Compute paths
  const rootPath = path.resolve(process.cwd(), projectInfo.projectName);
  const isMonorepo = structureConfig.structure === 'monorepo';

  const config: ProjectConfig = {
    projectName: projectInfo.projectName,
    description: projectInfo.description,
    backend: {
      framework: backendConfig.framework as BackendFramework,
      language: backendConfig.language as BackendLanguage,
      database: backendConfig.database as Database,
      orm: backendConfig.orm as ORM,
      auth: backendConfig.auth as AuthStrategy,
      mailing: backendConfig.mailing as MailingProvider,
      port: backendConfig.port,
    },
    frontend: {
      framework: frontendConfig.framework as FrontendFramework,
      styling: frontendConfig.styling as Styling,
      stateManagement: frontendConfig.stateManagement as StateManagement,
      port: frontendConfig.port,
    },
    structure: structureConfig.structure as ProjectStructure,
    packageManager: structureConfig.packageManager as PackageManager,
    initGit: structureConfig.initGit,
    docker: structureConfig.docker,
    rootPath,
    backendPath: isMonorepo
      ? path.join(rootPath, 'apps', 'backend')
      : frontendConfig.framework === 'none'
        ? rootPath
        : path.join(rootPath, 'backend'),
    frontendPath: isMonorepo
      ? path.join(rootPath, 'apps', 'frontend')
      : path.join(rootPath, 'frontend'),
  };

  return config;
}

// Show summary before generation
export function showSummary(config: ProjectConfig): void {
  console.log(chalk.cyan('\n═══════════════════════════════════════════════'));
  console.log(chalk.cyan('           📋 Configuration Summary'));
  console.log(chalk.cyan('═══════════════════════════════════════════════\n'));

  console.log(chalk.white('📦 Project:'), chalk.green(config.projectName));
  console.log(chalk.white('📝 Description:'), chalk.gray(config.description));
  console.log();

  console.log(chalk.yellow('⚙️  Backend:'));
  console.log(`   Framework:  ${chalk.green(config.backend.framework)}`);
  console.log(`   Language:   ${chalk.green(config.backend.language)}`);
  console.log(`   Database:   ${chalk.green(config.backend.database)}`);
  console.log(`   ORM:        ${chalk.green(config.backend.orm)}`);
  console.log(`   Auth:       ${chalk.green(config.backend.auth)}`);
  console.log(`   Mailing:    ${chalk.green(config.backend.mailing)}`);
  console.log(`   Port:       ${chalk.green(config.backend.port)}`);
  console.log();

  if (config.frontend.framework !== 'none') {
    console.log(chalk.yellow('🎨 Frontend:'));
    console.log(`   Framework:  ${chalk.green(config.frontend.framework)}`);
    console.log(`   Styling:    ${chalk.green(config.frontend.styling)}`);
    console.log(`   State:      ${chalk.green(config.frontend.stateManagement)}`);
    console.log(`   Port:       ${chalk.green(config.frontend.port)}`);
    console.log();
  }

  console.log(chalk.yellow('📁 Structure:'));
  console.log(`   Type:       ${chalk.green(config.structure)}`);
  console.log(`   Package:    ${chalk.green(config.packageManager)}`);
  console.log(`   Git:        ${chalk.green(config.initGit ? 'Yes' : 'No')}`);
  console.log(`   Docker:     ${chalk.green(config.docker ? 'Yes' : 'No')}`);
  console.log();
}

// Confirm before generation
export async function confirmGeneration(): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('Generate project with this configuration?'),
      default: true,
    },
  ]);

  return confirm;
}
