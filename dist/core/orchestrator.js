"use strict";
// ============================================
// Project Orchestrator
// Coordinates all generators based on config
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectOrchestrator = void 0;
const path_1 = __importDefault(require("path"));
const index_js_1 = require("../generators/index.js");
const index_js_2 = require("../utils/index.js");
class ProjectOrchestrator {
    config;
    constructor(config) {
        this.config = config;
    }
    async generate() {
        const totalSteps = this.calculateTotalSteps();
        let currentStep = 0;
        try {
            // Step 1: Create project directory
            currentStep++;
            (0, index_js_2.step)(currentStep, totalSteps, 'Creating project directory...');
            await this.createProjectStructure();
            (0, index_js_2.success)('Project directory created');
            // Step 2: Generate root files
            currentStep++;
            (0, index_js_2.step)(currentStep, totalSteps, 'Generating root configuration...');
            await this.generateRootFiles();
            (0, index_js_2.success)('Root configuration generated');
            // Step 3: Generate backend
            currentStep++;
            (0, index_js_2.step)(currentStep, totalSteps, 'Generating backend...');
            await this.generateBackend();
            (0, index_js_2.success)(`Backend generated (${this.config.backend.framework})`);
            // Step 4: Generate ORM (if applicable)
            if (this.config.backend.orm === 'prisma') {
                currentStep++;
                (0, index_js_2.step)(currentStep, totalSteps, 'Setting up Prisma...');
                const prismaGenerator = new index_js_1.PrismaGenerator(this.config);
                await prismaGenerator.generate();
                (0, index_js_2.success)('Prisma configured');
            }
            // Step 5: Generate frontend (if applicable)
            if (this.config.frontend.framework !== 'none') {
                currentStep++;
                (0, index_js_2.step)(currentStep, totalSteps, 'Generating frontend...');
                await this.generateFrontend();
                (0, index_js_2.success)(`Frontend generated (${this.config.frontend.framework})`);
            }
            // Step 6: Generate Docker files (if enabled)
            if (this.config.docker) {
                currentStep++;
                (0, index_js_2.step)(currentStep, totalSteps, 'Generating Docker configuration...');
                const dockerGenerator = new index_js_1.DockerGenerator(this.config);
                await dockerGenerator.generate();
                (0, index_js_2.success)('Docker configuration generated');
            }
            // Step 7: Generate README
            currentStep++;
            (0, index_js_2.step)(currentStep, totalSteps, 'Generating documentation...');
            const readmeGenerator = new index_js_1.ReadmeGenerator(this.config);
            await readmeGenerator.generate();
            (0, index_js_2.success)('Documentation generated');
            // Step 8: Initialize Git (if enabled)
            if (this.config.initGit) {
                currentStep++;
                (0, index_js_2.step)(currentStep, totalSteps, 'Initializing git repository...');
                await this.initializeGit();
                (0, index_js_2.success)('Git repository initialized');
            }
        }
        catch (err) {
            (0, index_js_2.error)(`Failed at step ${currentStep}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }
    calculateTotalSteps() {
        let steps = 4; // Base: directory, root files, backend, readme
        if (this.config.backend.orm === 'prisma')
            steps++;
        if (this.config.frontend.framework !== 'none')
            steps++;
        if (this.config.docker)
            steps++;
        if (this.config.initGit)
            steps++;
        return steps;
    }
    async createProjectStructure() {
        // Check if directory exists
        if (await (0, index_js_2.pathExists)(this.config.rootPath)) {
            throw new Error(`Directory ${this.config.projectName} already exists`);
        }
        // Create root directory
        await (0, index_js_2.ensureDir)(this.config.rootPath);
        // Create structure based on config
        if (this.config.structure === 'monorepo') {
            await (0, index_js_2.ensureDir)(path_1.default.join(this.config.rootPath, 'apps'));
            await (0, index_js_2.ensureDir)(this.config.backendPath);
            if (this.config.frontend.framework !== 'none') {
                await (0, index_js_2.ensureDir)(this.config.frontendPath);
            }
        }
        else {
            // Separate repos or backend only
            if (this.config.frontend.framework !== 'none') {
                await (0, index_js_2.ensureDir)(this.config.backendPath);
                await (0, index_js_2.ensureDir)(this.config.frontendPath);
            }
            // If backend only, backendPath is the same as rootPath
        }
        // Docker directory
        if (this.config.docker) {
            await (0, index_js_2.ensureDir)(path_1.default.join(this.config.rootPath, 'docker'));
        }
    }
    async generateRootFiles() {
        // Generate .env.example
        await this.generateRootEnvExample();
        // Generate .gitignore
        await (0, index_js_2.writeGitignore)(this.config.rootPath, {
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
    async generateRootEnvExample() {
        let content = `# ============================================
# ${this.config.projectName} Environment Variables
# ============================================

# Application
NODE_ENV=development

# Backend
BACKEND_PORT=${this.config.backend.port}
`;
        if (this.config.backend.database !== 'none') {
            const dbExamples = {
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
        await (0, index_js_2.writeFile)(path_1.default.join(this.config.rootPath, '.env.example'), content);
    }
    async generateMonorepoPackageJson() {
        const pm = this.config.packageManager;
        const pkg = {
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
            await (0, index_js_2.writeFile)(path_1.default.join(this.config.rootPath, 'pnpm-workspace.yaml'), `packages:
  - 'apps/*'
`);
        }
        else if (pm === 'yarn' || pm === 'npm') {
            pkg.workspaces = ['apps/*'];
        }
        await (0, index_js_2.writeJsonFile)(path_1.default.join(this.config.rootPath, 'package.json'), pkg);
    }
    async generateBackend() {
        let generator;
        switch (this.config.backend.framework) {
            case 'express':
                generator = new index_js_1.ExpressGenerator(this.config);
                break;
            case 'fastify':
                generator = new index_js_1.FastifyGenerator(this.config);
                break;
            case 'nestjs':
                generator = new index_js_1.NestJSGenerator(this.config);
                break;
            default:
                throw new Error(`Unknown backend framework: ${this.config.backend.framework}`);
        }
        await generator.generate();
    }
    async generateFrontend() {
        let generator;
        switch (this.config.frontend.framework) {
            case 'vue':
                generator = new index_js_1.VueGenerator(this.config);
                break;
            case 'react':
                generator = new index_js_1.ReactGenerator(this.config);
                break;
            case 'nextjs':
                generator = new index_js_1.NextJSGenerator(this.config);
                break;
            default:
                throw new Error(`Unknown frontend framework: ${this.config.frontend.framework}`);
        }
        await generator.generate();
    }
    async initializeGit() {
        if (this.config.structure === 'separate' && this.config.frontend.framework !== 'none') {
            // Initialize separate repos for backend and frontend
            await (0, index_js_2.initGit)(this.config.backendPath);
            await (0, index_js_2.writeGitignore)(this.config.backendPath, {
                isNode: true,
                hasEnv: true,
                hasPrisma: this.config.backend.orm === 'prisma',
            });
            await (0, index_js_2.initGit)(this.config.frontendPath);
            await (0, index_js_2.writeGitignore)(this.config.frontendPath, {
                isNode: true,
                hasEnv: true,
                hasNextJs: this.config.frontend.framework === 'nextjs',
            });
        }
        else {
            // Single repo (monorepo or backend only)
            await (0, index_js_2.initGit)(this.config.rootPath);
        }
    }
}
exports.ProjectOrchestrator = ProjectOrchestrator;
//# sourceMappingURL=orchestrator.js.map