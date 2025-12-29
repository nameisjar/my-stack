// ============================================
// Project Orchestrator
// Coordinates all generators based on config
// ============================================

import path from 'path';
import type { ProjectConfig } from '../types/index.js';
import {
  ExpressGenerator,
  FastifyGenerator,
  NestJSGenerator,
  PrismaGenerator,
  MailingGenerator,
  VueGenerator,
  ReactGenerator,
  NextJSGenerator,
  DockerGenerator,
  ReadmeGenerator,
} from '../generators/index.js';
import {
  ensureDir,
  writeFile,
  writeJsonFile,
  pathExists,
  initGit,
  writeGitignore,
  createSpinner,
  success,
  error,
  step,
} from '../utils/index.js';

export class ProjectOrchestrator {
  private config: ProjectConfig;

  constructor(config: ProjectConfig) {
    this.config = config;
  }

  async generate(): Promise<void> {
    const totalSteps = this.calculateTotalSteps();
    let currentStep = 0;

    try {
      // Step 1: Create project directory
      currentStep++;
      step(currentStep, totalSteps, 'Creating project directory...');
      await this.createProjectStructure();
      success('Project directory created');

      // Step 2: Generate root files
      currentStep++;
      step(currentStep, totalSteps, 'Generating root configuration...');
      await this.generateRootFiles();
      success('Root configuration generated');

      // Step 3: Generate backend
      currentStep++;
      step(currentStep, totalSteps, 'Generating backend...');
      await this.generateBackend();
      success(`Backend generated (${this.config.backend.framework})`);

      // Step 4: Generate ORM (if applicable)
      if (this.config.backend.orm === 'prisma') {
        currentStep++;
        step(currentStep, totalSteps, 'Setting up Prisma...');
        const prismaGenerator = new PrismaGenerator(this.config);
        await prismaGenerator.generate();
        success('Prisma configured');
      }

      // Step 5: Generate Mailing (if applicable)
      if (this.config.backend.mailing !== 'none') {
        currentStep++;
        step(currentStep, totalSteps, 'Setting up mailing...');
        const mailingGenerator = new MailingGenerator(this.config);
        await mailingGenerator.generate();
        success(`Mailing configured (${this.config.backend.mailing})`);
      }

      // Step 6: Generate frontend (if applicable)
      if (this.config.frontend.framework !== 'none') {
        currentStep++;
        step(currentStep, totalSteps, 'Generating frontend...');
        await this.generateFrontend();
        success(`Frontend generated (${this.config.frontend.framework})`);
      }

      // Step 7: Generate Docker files (if enabled)
      if (this.config.docker) {
        currentStep++;
        step(currentStep, totalSteps, 'Generating Docker configuration...');
        const dockerGenerator = new DockerGenerator(this.config);
        await dockerGenerator.generate();
        success('Docker configuration generated');
      }

      // Step 8: Generate README
      currentStep++;
      step(currentStep, totalSteps, 'Generating documentation...');
      const readmeGenerator = new ReadmeGenerator(this.config);
      await readmeGenerator.generate();
      success('Documentation generated');

      // Step 9: Initialize Git (if enabled)
      if (this.config.initGit) {
        currentStep++;
        step(currentStep, totalSteps, 'Initializing git repository...');
        await this.initializeGit();
        success('Git repository initialized');
      }
    } catch (err) {
      error(`Failed at step ${currentStep}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  private calculateTotalSteps(): number {
    let steps = 4; // Base: directory, root files, backend, readme

    if (this.config.backend.orm === 'prisma') steps++;
    if (this.config.backend.mailing !== 'none') steps++;
    if (this.config.frontend.framework !== 'none') steps++;
    if (this.config.docker) steps++;
    if (this.config.initGit) steps++;

    return steps;
  }

  private async createProjectStructure(): Promise<void> {
    // Check if directory exists
    if (await pathExists(this.config.rootPath)) {
      throw new Error(`Directory ${this.config.projectName} already exists`);
    }

    // Create root directory
    await ensureDir(this.config.rootPath);

    // Create structure based on config
    if (this.config.structure === 'monorepo') {
      await ensureDir(path.join(this.config.rootPath, 'apps'));
      await ensureDir(this.config.backendPath);
      if (this.config.frontend.framework !== 'none') {
        await ensureDir(this.config.frontendPath);
      }
    } else {
      // Separate repos or backend only
      if (this.config.frontend.framework !== 'none') {
        await ensureDir(this.config.backendPath);
        await ensureDir(this.config.frontendPath);
      }
      // If backend only, backendPath is the same as rootPath
    }

    // Docker directory
    if (this.config.docker) {
      await ensureDir(path.join(this.config.rootPath, 'docker'));
    }
  }

  private async generateRootFiles(): Promise<void> {
    // Generate .env.example
    await this.generateRootEnvExample();

    // Generate .gitignore
    await writeGitignore(this.config.rootPath, {
      isNode: true,
      hasEnv: true,
      hasPrisma: this.config.backend.orm === 'prisma',
      hasNextJs: this.config.frontend.framework === 'nextjs',
    });

    // Generate monorepo package.json if needed
    if (this.config.structure === 'monorepo') {
      await this.generateMonorepoPackageJson();
    }
  }

  private async generateRootEnvExample(): Promise<void> {
    let content = `# ============================================
# ${this.config.projectName} Environment Variables
# ============================================

# Application
NODE_ENV=development

# Backend
BACKEND_PORT=${this.config.backend.port}
`;

    if (this.config.backend.database !== 'none') {
      const dbExamples: Record<string, string> = {
        postgresql: 'postgresql://user:password@localhost:5432/dbname',
        mysql: 'mysql://user:password@localhost:3306/dbname',
        mongodb: 'mongodb://localhost:27017/dbname',
        sqlite: 'file:./dev.db',
      };

      content += `
# Database
DATABASE_URL="${dbExamples[this.config.backend.database] || ''}"
`;
    }

    if (this.config.backend.auth === 'jwt') {
      content += `
# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
`;
    }

    if (this.config.backend.auth === 'session') {
      content += `
# Session
SESSION_SECRET=your-session-secret-change-in-production
REDIS_URL=redis://localhost:6379
`;
    }

    if (this.config.frontend.framework !== 'none') {
      content += `
# Frontend
FRONTEND_PORT=${this.config.frontend.port}
`;
    }

    await writeFile(path.join(this.config.rootPath, '.env.example'), content);
  }

  private async generateMonorepoPackageJson(): Promise<void> {
    const pm = this.config.packageManager;

    const pkg: Record<string, unknown> = {
      name: this.config.projectName,
      version: '1.0.0',
      private: true,
      description: this.config.description,
      scripts: {
        dev: 'concurrently "npm:dev:*"',
        'dev:backend': `${pm} --filter backend dev`,
        'dev:frontend': `${pm} --filter frontend dev`,
        build: `${pm} --filter "*" build`,
        lint: `${pm} --filter "*" lint`,
        format: `${pm} --filter "*" format`,
        test: `${pm} --filter "*" test`,
      },
      devDependencies: {
        concurrently: '^8.2.2',
      },
    };

    // Add workspaces config based on package manager
    if (pm === 'pnpm') {
      // pnpm uses pnpm-workspace.yaml
      await writeFile(
        path.join(this.config.rootPath, 'pnpm-workspace.yaml'),
        `packages:
  - 'apps/*'
`
      );
    } else if (pm === 'yarn' || pm === 'npm') {
      pkg.workspaces = ['apps/*'];
    }

    await writeJsonFile(path.join(this.config.rootPath, 'package.json'), pkg);
  }

  private async generateBackend(): Promise<void> {
    let generator;

    switch (this.config.backend.framework) {
      case 'express':
        generator = new ExpressGenerator(this.config);
        break;
      case 'fastify':
        generator = new FastifyGenerator(this.config);
        break;
      case 'nestjs':
        generator = new NestJSGenerator(this.config);
        break;
      default:
        throw new Error(`Unknown backend framework: ${this.config.backend.framework}`);
    }

    await generator.generate();
  }

  private async generateFrontend(): Promise<void> {
    let generator;

    switch (this.config.frontend.framework) {
      case 'vue':
        generator = new VueGenerator(this.config);
        break;
      case 'react':
        generator = new ReactGenerator(this.config);
        break;
      case 'nextjs':
        generator = new NextJSGenerator(this.config);
        break;
      default:
        throw new Error(`Unknown frontend framework: ${this.config.frontend.framework}`);
    }

    await generator.generate();
  }

  private async initializeGit(): Promise<void> {
    if (this.config.structure === 'separate' && this.config.frontend.framework !== 'none') {
      // Initialize separate repos for backend and frontend
      await initGit(this.config.backendPath);
      await writeGitignore(this.config.backendPath, {
        isNode: true,
        hasEnv: true,
        hasPrisma: this.config.backend.orm === 'prisma',
      });

      await initGit(this.config.frontendPath);
      await writeGitignore(this.config.frontendPath, {
        isNode: true,
        hasEnv: true,
        hasNextJs: this.config.frontend.framework === 'nextjs',
      });
    } else {
      // Single repo (monorepo or backend only)
      await initGit(this.config.rootPath);
    }
  }
}
