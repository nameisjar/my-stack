// ============================================
// Type definitions untuk CLI Boilerplate Generator
// ============================================

// Backend Options
export type BackendFramework = 'express' | 'fastify' | 'nestjs';
export type BackendLanguage = 'javascript' | 'typescript';
export type Database = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'none';
export type ORM = 'prisma' | 'sequelize' | 'mongoose' | 'none';
export type AuthStrategy = 'jwt' | 'session' | 'none';

// Mailing Options
export type MailingProvider = 'nodemailer' | 'resend' | 'none';

// Frontend Options
export type FrontendFramework = 'vue' | 'react' | 'nextjs' | 'none';
export type Styling = 'tailwind' | 'css' | 'scss';
export type StateManagement = 'pinia' | 'redux' | 'zustand' | 'none';

// Project Structure
export type ProjectStructure = 'monorepo' | 'separate';
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

// Full Project Configuration
export interface ProjectConfig {
  // Project Info
  projectName: string;
  description: string;

  // Backend Config
  backend: {
    framework: BackendFramework;
    language: BackendLanguage;
    database: Database;
    orm: ORM;
    auth: AuthStrategy;
    mailing: MailingProvider;
    port: number;
  };

  // Frontend Config
  frontend: {
    framework: FrontendFramework;
    styling: Styling;
    stateManagement: StateManagement;
    port: number;
  };

  // Structure & Tools
  structure: ProjectStructure;
  packageManager: PackageManager;
  initGit: boolean;
  docker: boolean;

  // Paths (computed)
  rootPath: string;
  backendPath: string;
  frontendPath: string;
}

// Generator Interface
export interface Generator {
  name: string;
  generate(config: ProjectConfig): Promise<void>;
}

// Template Context
export interface TemplateContext {
  projectName: string;
  description: string;
  backendFramework: BackendFramework;
  frontendFramework: FrontendFramework;
  database: Database;
  orm: ORM;
  auth: AuthStrategy;
  language: BackendLanguage;
  packageManager: PackageManager;
  isMonorepo: boolean;
  hasDocker: boolean;
  backendPort: number;
  frontendPort: number;
}

// File Template
export interface FileTemplate {
  path: string;
  content: string;
  condition?: (config: ProjectConfig) => boolean;
}

// Prompt Choice
export interface PromptChoice<T = string> {
  name: string;
  value: T;
  description?: string;
}

// CLI Options (dari command line args)
export interface CLIOptions {
  projectName?: string;
  template?: string;
  yes?: boolean;
  skipInstall?: boolean;
}
