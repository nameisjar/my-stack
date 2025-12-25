"use strict";
// ============================================
// Interactive Prompts untuk Stack Selection
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBanner = showBanner;
exports.runPrompts = runPrompts;
exports.showSummary = showSummary;
exports.confirmGeneration = confirmGeneration;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const validate_npm_package_name_1 = __importDefault(require("validate-npm-package-name"));
const index_js_1 = require("../constants/index.js");
// Banner ASCII
function showBanner() {
    console.log(chalk_1.default.cyan(`
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
function validateProjectName(input) {
    if (!input.trim()) {
        return 'Project name is required';
    }
    const result = (0, validate_npm_package_name_1.default)(input);
    if (!result.validForNewPackages) {
        const errors = [...(result.errors || []), ...(result.warnings || [])];
        return `Invalid package name: ${errors.join(', ')}`;
    }
    return true;
}
// Main Prompts
async function runPrompts() {
    showBanner();
    console.log(chalk_1.default.yellow('\n📦 Project Information\n'));
    // Project Info
    const projectInfo = await inquirer_1.default.prompt([
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
    console.log(chalk_1.default.yellow('\n⚙️  Backend Configuration\n'));
    // Backend Config
    const backendConfig = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'framework',
            message: 'Backend framework:',
            choices: index_js_1.BACKEND_FRAMEWORKS.map((f) => ({
                name: `${f.name} - ${chalk_1.default.gray(f.description)}`,
                value: f.value,
            })),
        },
        {
            type: 'list',
            name: 'language',
            message: 'Language:',
            choices: index_js_1.LANGUAGES.map((l) => ({
                name: `${l.name} - ${chalk_1.default.gray(l.description)}`,
                value: l.value,
            })),
            when: (answers) => answers.framework !== 'nestjs', // NestJS is TypeScript only
        },
        {
            type: 'list',
            name: 'database',
            message: 'Database:',
            choices: index_js_1.DATABASES.map((d) => ({
                name: `${d.name} - ${chalk_1.default.gray(d.description)}`,
                value: d.value,
            })),
        },
        {
            type: 'list',
            name: 'orm',
            message: 'ORM/ODM:',
            choices: (answers) => {
                const compatibleORMs = (0, index_js_1.getCompatibleORMs)(answers.database);
                return index_js_1.ORMS.filter((o) => compatibleORMs.includes(o.value)).map((o) => ({
                    name: `${o.name} - ${chalk_1.default.gray(o.description)}`,
                    value: o.value,
                }));
            },
            when: (answers) => answers.database !== 'none',
        },
        {
            type: 'list',
            name: 'auth',
            message: 'Authentication:',
            choices: index_js_1.AUTH_STRATEGIES.map((a) => ({
                name: `${a.name} - ${chalk_1.default.gray(a.description)}`,
                value: a.value,
            })),
        },
        {
            type: 'number',
            name: 'port',
            message: 'Backend port:',
            default: index_js_1.DEFAULT_BACKEND_PORT,
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
    console.log(chalk_1.default.yellow('\n🎨 Frontend Configuration\n'));
    // Frontend Config
    const frontendConfig = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'framework',
            message: 'Frontend framework:',
            choices: index_js_1.FRONTEND_FRAMEWORKS.map((f) => ({
                name: `${f.name} - ${chalk_1.default.gray(f.description)}`,
                value: f.value,
            })),
        },
        {
            type: 'list',
            name: 'styling',
            message: 'Styling:',
            choices: index_js_1.STYLING_OPTIONS.map((s) => ({
                name: `${s.name} - ${chalk_1.default.gray(s.description)}`,
                value: s.value,
            })),
            when: (answers) => answers.framework !== 'none',
        },
        {
            type: 'list',
            name: 'stateManagement',
            message: 'State management:',
            choices: (answers) => {
                const options = (0, index_js_1.getStateManagementOptions)(answers.framework);
                return options.map((s) => ({
                    name: `${s.name}${s.description ? ` - ${chalk_1.default.gray(s.description)}` : ''}`,
                    value: s.value,
                }));
            },
            when: (answers) => answers.framework !== 'none',
        },
        {
            type: 'number',
            name: 'port',
            message: 'Frontend dev server port:',
            default: index_js_1.DEFAULT_FRONTEND_PORT,
            when: (answers) => answers.framework !== 'none',
        },
    ]);
    // Defaults for backend-only
    if (frontendConfig.framework === 'none') {
        frontendConfig.styling = 'css';
        frontendConfig.stateManagement = 'none';
        frontendConfig.port = index_js_1.DEFAULT_FRONTEND_PORT;
    }
    console.log(chalk_1.default.yellow('\n📁 Project Structure\n'));
    // Project Structure
    const structureConfig = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'structure',
            message: 'Project structure:',
            choices: [
                {
                    name: `Monorepo - ${chalk_1.default.gray('Single repo with apps/ folder')}`,
                    value: 'monorepo',
                },
                {
                    name: `Separate repos - ${chalk_1.default.gray('Independent frontend & backend')}`,
                    value: 'separate',
                },
            ],
            when: () => frontendConfig.framework !== 'none',
        },
        {
            type: 'list',
            name: 'packageManager',
            message: 'Package manager:',
            choices: index_js_1.PACKAGE_MANAGERS.map((p) => ({
                name: `${p.name} - ${chalk_1.default.gray(p.description)}`,
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
    const rootPath = path_1.default.resolve(process.cwd(), projectInfo.projectName);
    const isMonorepo = structureConfig.structure === 'monorepo';
    const config = {
        projectName: projectInfo.projectName,
        description: projectInfo.description,
        backend: {
            framework: backendConfig.framework,
            language: backendConfig.language,
            database: backendConfig.database,
            orm: backendConfig.orm,
            auth: backendConfig.auth,
            port: backendConfig.port,
        },
        frontend: {
            framework: frontendConfig.framework,
            styling: frontendConfig.styling,
            stateManagement: frontendConfig.stateManagement,
            port: frontendConfig.port,
        },
        structure: structureConfig.structure,
        packageManager: structureConfig.packageManager,
        initGit: structureConfig.initGit,
        docker: structureConfig.docker,
        rootPath,
        backendPath: isMonorepo
            ? path_1.default.join(rootPath, 'apps', 'backend')
            : frontendConfig.framework === 'none'
                ? rootPath
                : path_1.default.join(rootPath, 'backend'),
        frontendPath: isMonorepo
            ? path_1.default.join(rootPath, 'apps', 'frontend')
            : path_1.default.join(rootPath, 'frontend'),
    };
    return config;
}
// Show summary before generation
function showSummary(config) {
    console.log(chalk_1.default.cyan('\n═══════════════════════════════════════════════'));
    console.log(chalk_1.default.cyan('           📋 Configuration Summary'));
    console.log(chalk_1.default.cyan('═══════════════════════════════════════════════\n'));
    console.log(chalk_1.default.white('📦 Project:'), chalk_1.default.green(config.projectName));
    console.log(chalk_1.default.white('📝 Description:'), chalk_1.default.gray(config.description));
    console.log();
    console.log(chalk_1.default.yellow('⚙️  Backend:'));
    console.log(`   Framework:  ${chalk_1.default.green(config.backend.framework)}`);
    console.log(`   Language:   ${chalk_1.default.green(config.backend.language)}`);
    console.log(`   Database:   ${chalk_1.default.green(config.backend.database)}`);
    console.log(`   ORM:        ${chalk_1.default.green(config.backend.orm)}`);
    console.log(`   Auth:       ${chalk_1.default.green(config.backend.auth)}`);
    console.log(`   Port:       ${chalk_1.default.green(config.backend.port)}`);
    console.log();
    if (config.frontend.framework !== 'none') {
        console.log(chalk_1.default.yellow('🎨 Frontend:'));
        console.log(`   Framework:  ${chalk_1.default.green(config.frontend.framework)}`);
        console.log(`   Styling:    ${chalk_1.default.green(config.frontend.styling)}`);
        console.log(`   State:      ${chalk_1.default.green(config.frontend.stateManagement)}`);
        console.log(`   Port:       ${chalk_1.default.green(config.frontend.port)}`);
        console.log();
    }
    console.log(chalk_1.default.yellow('📁 Structure:'));
    console.log(`   Type:       ${chalk_1.default.green(config.structure)}`);
    console.log(`   Package:    ${chalk_1.default.green(config.packageManager)}`);
    console.log(`   Git:        ${chalk_1.default.green(config.initGit ? 'Yes' : 'No')}`);
    console.log(`   Docker:     ${chalk_1.default.green(config.docker ? 'Yes' : 'No')}`);
    console.log();
}
// Confirm before generation
async function confirmGeneration() {
    const { confirm } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: chalk_1.default.yellow('Generate project with this configuration?'),
            default: true,
        },
    ]);
    return confirm;
}
//# sourceMappingURL=index.js.map