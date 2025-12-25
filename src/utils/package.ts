// ============================================
// Package Manager Utilities
// ============================================

import { execa } from 'execa';
import type { PackageManager } from '../types/index.js';

/**
 * Get install command for package manager
 */
export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npm install';
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn';
  }
}

/**
 * Get add package command
 */
export function getAddCommand(pm: PackageManager, isDev = false): string {
  const devFlag = isDev ? ' -D' : '';
  switch (pm) {
    case 'npm':
      return `npm install${isDev ? ' --save-dev' : ''}`;
    case 'pnpm':
      return `pnpm add${devFlag}`;
    case 'yarn':
      return `yarn add${devFlag}`;
  }
}

/**
 * Get run script command
 */
export function getRunCommand(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npm run';
    case 'pnpm':
      return 'pnpm';
    case 'yarn':
      return 'yarn';
  }
}

/**
 * Get exec command (for running bin scripts)
 */
export function getExecCommand(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npx';
    case 'pnpm':
      return 'pnpm exec';
    case 'yarn':
      return 'yarn';
  }
}

/**
 * Install dependencies
 */
export async function installDependencies(targetPath: string, pm: PackageManager): Promise<void> {
  const args = pm === 'yarn' ? [] : ['install'];
  await execa(pm, args, { cwd: targetPath, stdio: 'inherit' });
}

/**
 * Generate package.json scripts section
 */
export function generateScripts(options: {
  isBackend?: boolean;
  isFrontend?: boolean;
  isMonorepo?: boolean;
  framework?: string;
  pm: PackageManager;
}): Record<string, string> {
  const run = getRunCommand(options.pm);

  if (options.isMonorepo) {
    return {
      dev: `${run} dev:backend & ${run} dev:frontend`,
      'dev:backend': `${run} --filter backend dev`,
      'dev:frontend': `${run} --filter frontend dev`,
      build: `${run} build:backend && ${run} build:frontend`,
      'build:backend': `${run} --filter backend build`,
      'build:frontend': `${run} --filter frontend build`,
      lint: `${run} --filter \"*\" lint`,
      format: `${run} --filter \"*\" format`,
    };
  }

  if (options.isBackend) {
    return {
      dev: 'tsx watch src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      lint: 'eslint src --ext .ts,.js',
      format: 'prettier --write "src/**/*.{ts,js}"',
    };
  }

  if (options.isFrontend) {
    switch (options.framework) {
      case 'vue':
        return {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'eslint src --ext .vue,.ts,.js',
          format: 'prettier --write "src/**/*.{vue,ts,js}"',
        };
      case 'react':
        return {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'eslint src --ext .tsx,.ts,.js',
          format: 'prettier --write "src/**/*.{tsx,ts,js}"',
        };
      case 'nextjs':
        return {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
          format: 'prettier --write "src/**/*.{tsx,ts,js}"',
        };
      default:
        return {};
    }
  }

  return {};
}

/**
 * Get lock file name for package manager
 */
export function getLockFileName(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'package-lock.json';
    case 'pnpm':
      return 'pnpm-lock.yaml';
    case 'yarn':
      return 'yarn.lock';
  }
}
