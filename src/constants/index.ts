// ============================================
// Constants & Default Values
// ============================================

import type {
  BackendFramework,
  BackendLanguage,
  Database,
  ORM,
  AuthStrategy,
  FrontendFramework,
  Styling,
  StateManagement,
  PackageManager,
  MailingProvider,
  PromptChoice,
} from '../types/index.js';

// Backend Framework Choices
export const BACKEND_FRAMEWORKS: PromptChoice<BackendFramework>[] = [
  { name: 'Express.js', value: 'express', description: 'Minimal & flexible Node.js framework' },
  { name: 'Fastify', value: 'fastify', description: 'Fast & low overhead framework' },
  { name: 'NestJS', value: 'nestjs', description: 'Progressive Node.js framework (TypeScript)' },
];

// Language Choices
export const LANGUAGES: PromptChoice<BackendLanguage>[] = [
  { name: 'TypeScript', value: 'typescript', description: 'Recommended for production' },
  { name: 'JavaScript', value: 'javascript', description: 'Quick prototyping' },
];

// Database Choices
export const DATABASES: PromptChoice<Database>[] = [
  { name: 'PostgreSQL', value: 'postgresql', description: 'Powerful open-source RDBMS' },
  { name: 'MySQL', value: 'mysql', description: 'Popular open-source RDBMS' },
  { name: 'MongoDB', value: 'mongodb', description: 'NoSQL document database' },
  { name: 'SQLite', value: 'sqlite', description: 'Lightweight file-based database' },
  { name: 'None', value: 'none', description: 'Skip database setup' },
];

// ORM Choices
export const ORMS: PromptChoice<ORM>[] = [
  { name: 'Prisma', value: 'prisma', description: 'Modern TypeScript ORM' },
  { name: 'Sequelize', value: 'sequelize', description: 'Promise-based ORM for SQL' },
  { name: 'Mongoose', value: 'mongoose', description: 'MongoDB object modeling' },
  { name: 'None', value: 'none', description: 'Raw queries only' },
];

// Auth Strategy Choices
export const AUTH_STRATEGIES: PromptChoice<AuthStrategy>[] = [
  { name: 'JWT (JSON Web Token)', value: 'jwt', description: 'Stateless authentication' },
  { name: 'Session', value: 'session', description: 'Server-side session storage' },
  { name: 'None', value: 'none', description: 'No authentication' },
];

// Mailing Provider Choices
export const MAILING_PROVIDERS: PromptChoice<MailingProvider>[] = [
  { name: 'Nodemailer', value: 'nodemailer', description: 'Classic email sending library with SMTP' },
  { name: 'Resend', value: 'resend', description: 'Modern email API for developers' },
  { name: 'None', value: 'none', description: 'No mailing setup' },
];

// Frontend Framework Choices
export const FRONTEND_FRAMEWORKS: PromptChoice<FrontendFramework>[] = [
  { name: 'Vue 3', value: 'vue', description: 'Progressive JavaScript framework' },
  { name: 'React', value: 'react', description: 'Library for building UIs' },
  { name: 'Next.js', value: 'nextjs', description: 'React framework with SSR' },
  { name: 'None (Backend only)', value: 'none', description: 'Skip frontend setup' },
];

// Styling Choices
export const STYLING_OPTIONS: PromptChoice<Styling>[] = [
  { name: 'Tailwind CSS', value: 'tailwind', description: 'Utility-first CSS framework' },
  { name: 'Plain CSS', value: 'css', description: 'Traditional CSS' },
  { name: 'SCSS/Sass', value: 'scss', description: 'CSS preprocessor' },
];

// State Management Choices (dynamic based on frontend)
export const STATE_MANAGEMENT_VUE: PromptChoice<StateManagement>[] = [
  { name: 'Pinia', value: 'pinia', description: 'Official Vue state management' },
  { name: 'None', value: 'none', description: 'No state management' },
];

export const STATE_MANAGEMENT_REACT: PromptChoice<StateManagement>[] = [
  { name: 'Redux Toolkit', value: 'redux', description: 'Predictable state container' },
  { name: 'Zustand', value: 'zustand', description: 'Lightweight state management' },
  { name: 'None', value: 'none', description: 'No state management (use React Context)' },
];

// Package Manager Choices
export const PACKAGE_MANAGERS: PromptChoice<PackageManager>[] = [
  { name: 'pnpm', value: 'pnpm', description: 'Fast, disk space efficient (Recommended)' },
  { name: 'npm', value: 'npm', description: 'Default Node.js package manager' },
  { name: 'yarn', value: 'yarn', description: 'Fast, reliable package manager' },
];

// Default Ports
export const DEFAULT_BACKEND_PORT = 3000;
export const DEFAULT_FRONTEND_PORT = 5173;

// Compatible ORM-Database combinations
export const ORM_DATABASE_COMPATIBILITY: Record<ORM, Database[]> = {
  prisma: ['postgresql', 'mysql', 'mongodb', 'sqlite'],
  sequelize: ['postgresql', 'mysql', 'sqlite'],
  mongoose: ['mongodb'],
  none: ['postgresql', 'mysql', 'mongodb', 'sqlite', 'none'],
};

// Get compatible ORMs for a database
export function getCompatibleORMs(database: Database): ORM[] {
  if (database === 'none') return ['none'];
  
  return (Object.entries(ORM_DATABASE_COMPATIBILITY) as [ORM, Database[]][])
    .filter(([_, dbs]) => dbs.includes(database))
    .map(([orm]) => orm);
}

// Get state management options based on frontend
export function getStateManagementOptions(frontend: FrontendFramework): PromptChoice<StateManagement>[] {
  switch (frontend) {
    case 'vue':
      return STATE_MANAGEMENT_VUE;
    case 'react':
    case 'nextjs':
      return STATE_MANAGEMENT_REACT;
    default:
      return [{ name: 'None', value: 'none' }];
  }
}
