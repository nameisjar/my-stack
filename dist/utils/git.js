"use strict";
// ============================================
// Git Utilities
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGit = initGit;
exports.createInitialCommit = createInitialCommit;
exports.generateGitignore = generateGitignore;
exports.writeGitignore = writeGitignore;
const execa_1 = require("execa");
const path_1 = __importDefault(require("path"));
const fs_js_1 = require("./fs.js");
/**
 * Initialize git repository
 */
async function initGit(targetPath) {
    await (0, execa_1.execa)('git', ['init'], { cwd: targetPath });
}
/**
 * Create initial commit
 */
async function createInitialCommit(targetPath, message) {
    await (0, execa_1.execa)('git', ['add', '.'], { cwd: targetPath });
    await (0, execa_1.execa)('git', ['commit', '-m', message], { cwd: targetPath });
}
/**
 * Generate .gitignore content
 */
function generateGitignore(options) {
    const lines = [
        '# Dependencies',
        'node_modules/',
        '',
        '# Build outputs',
        'dist/',
        'build/',
        '.next/',
        'out/',
        '',
        '# IDE',
        '.idea/',
        '.vscode/',
        '*.swp',
        '*.swo',
        '',
        '# OS',
        '.DS_Store',
        'Thumbs.db',
        '',
        '# Logs',
        'logs/',
        '*.log',
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
        'pnpm-debug.log*',
        '',
        '# Test coverage',
        'coverage/',
        '.nyc_output/',
    ];
    if (options.hasEnv) {
        lines.push('', '# Environment', '.env', '.env.local', '.env.*.local', '!.env.example');
    }
    if (options.hasPrisma) {
        lines.push('', '# Prisma', 'prisma/*.db', 'prisma/*.db-journal');
    }
    if (options.hasNextJs) {
        lines.push('', '# Next.js', '.next/', 'out/', '.vercel/');
    }
    lines.push('', '# Misc', '*.tgz', '.cache/', '.temp/', '.tmp/', '');
    return lines.join('\n');
}
/**
 * Write .gitignore file
 */
async function writeGitignore(targetPath, options) {
    const content = generateGitignore(options);
    await (0, fs_js_1.writeFile)(path_1.default.join(targetPath, '.gitignore'), content);
}
//# sourceMappingURL=git.js.map