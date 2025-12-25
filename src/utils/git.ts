// ============================================
// Git Utilities
// ============================================

import { execa } from 'execa';
import path from 'path';
import { writeFile } from './fs.js';

/**
 * Initialize git repository
 */
export async function initGit(targetPath: string): Promise<void> {
  await execa('git', ['init'], { cwd: targetPath });
}

/**
 * Create initial commit
 */
export async function createInitialCommit(targetPath: string, message: string): Promise<void> {
  await execa('git', ['add', '.'], { cwd: targetPath });
  await execa('git', ['commit', '-m', message], { cwd: targetPath });
}

/**
 * Generate .gitignore content
 */
export function generateGitignore(options: {
  isNode?: boolean;
  hasEnv?: boolean;
  hasPrisma?: boolean;
  hasNextJs?: boolean;
}): string {
  const lines: string[] = [
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
export async function writeGitignore(
  targetPath: string,
  options: {
    isNode?: boolean;
    hasEnv?: boolean;
    hasPrisma?: boolean;
    hasNextJs?: boolean;
  }
): Promise<void> {
  const content = generateGitignore(options);
  await writeFile(path.join(targetPath, '.gitignore'), content);
}
