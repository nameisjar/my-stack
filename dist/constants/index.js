"use strict";
// ============================================
// Constants & Default Values
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORM_DATABASE_COMPATIBILITY = exports.DEFAULT_FRONTEND_PORT = exports.DEFAULT_BACKEND_PORT = exports.PACKAGE_MANAGERS = exports.STATE_MANAGEMENT_REACT = exports.STATE_MANAGEMENT_VUE = exports.STYLING_OPTIONS = exports.FRONTEND_FRAMEWORKS = exports.MAILING_PROVIDERS = exports.AUTH_STRATEGIES = exports.ORMS = exports.DATABASES = exports.LANGUAGES = exports.BACKEND_FRAMEWORKS = void 0;
exports.getCompatibleORMs = getCompatibleORMs;
exports.getStateManagementOptions = getStateManagementOptions;
// Backend Framework Choices
exports.BACKEND_FRAMEWORKS = [
    { name: 'Express.js', value: 'express', description: 'Minimal & flexible Node.js framework' },
    { name: 'Fastify', value: 'fastify', description: 'Fast & low overhead framework' },
    { name: 'NestJS', value: 'nestjs', description: 'Progressive Node.js framework (TypeScript)' },
];
// Language Choices
exports.LANGUAGES = [
    { name: 'TypeScript', value: 'typescript', description: 'Recommended for production' },
    { name: 'JavaScript', value: 'javascript', description: 'Quick prototyping' },
];
// Database Choices
exports.DATABASES = [
    { name: 'PostgreSQL', value: 'postgresql', description: 'Powerful open-source RDBMS' },
    { name: 'MySQL', value: 'mysql', description: 'Popular open-source RDBMS' },
    { name: 'MongoDB', value: 'mongodb', description: 'NoSQL document database' },
    { name: 'SQLite', value: 'sqlite', description: 'Lightweight file-based database' },
    { name: 'None', value: 'none', description: 'Skip database setup' },
];
// ORM Choices
exports.ORMS = [
    { name: 'Prisma', value: 'prisma', description: 'Modern TypeScript ORM' },
    { name: 'Sequelize', value: 'sequelize', description: 'Promise-based ORM for SQL' },
    { name: 'Mongoose', value: 'mongoose', description: 'MongoDB object modeling' },
    { name: 'None', value: 'none', description: 'Raw queries only' },
];
// Auth Strategy Choices
exports.AUTH_STRATEGIES = [
    { name: 'JWT (JSON Web Token)', value: 'jwt', description: 'Stateless authentication' },
    { name: 'Session', value: 'session', description: 'Server-side session storage' },
    { name: 'None', value: 'none', description: 'No authentication' },
];
// Mailing Provider Choices
exports.MAILING_PROVIDERS = [
    { name: 'Nodemailer', value: 'nodemailer', description: 'Classic email sending library with SMTP' },
    { name: 'Resend', value: 'resend', description: 'Modern email API for developers' },
    { name: 'None', value: 'none', description: 'No mailing setup' },
];
// Frontend Framework Choices
exports.FRONTEND_FRAMEWORKS = [
    { name: 'Vue 3', value: 'vue', description: 'Progressive JavaScript framework' },
    { name: 'React', value: 'react', description: 'Library for building UIs' },
    { name: 'Next.js', value: 'nextjs', description: 'React framework with SSR' },
    { name: 'None (Backend only)', value: 'none', description: 'Skip frontend setup' },
];
// Styling Choices
exports.STYLING_OPTIONS = [
    { name: 'Tailwind CSS', value: 'tailwind', description: 'Utility-first CSS framework' },
    { name: 'Plain CSS', value: 'css', description: 'Traditional CSS' },
    { name: 'SCSS/Sass', value: 'scss', description: 'CSS preprocessor' },
];
// State Management Choices (dynamic based on frontend)
exports.STATE_MANAGEMENT_VUE = [
    { name: 'Pinia', value: 'pinia', description: 'Official Vue state management' },
    { name: 'None', value: 'none', description: 'No state management' },
];
exports.STATE_MANAGEMENT_REACT = [
    { name: 'Redux Toolkit', value: 'redux', description: 'Predictable state container' },
    { name: 'Zustand', value: 'zustand', description: 'Lightweight state management' },
    { name: 'None', value: 'none', description: 'No state management (use React Context)' },
];
// Package Manager Choices
exports.PACKAGE_MANAGERS = [
    { name: 'pnpm', value: 'pnpm', description: 'Fast, disk space efficient (Recommended)' },
    { name: 'npm', value: 'npm', description: 'Default Node.js package manager' },
    { name: 'yarn', value: 'yarn', description: 'Fast, reliable package manager' },
];
// Default Ports
exports.DEFAULT_BACKEND_PORT = 3000;
exports.DEFAULT_FRONTEND_PORT = 5173;
// Compatible ORM-Database combinations
exports.ORM_DATABASE_COMPATIBILITY = {
    prisma: ['postgresql', 'mysql', 'mongodb', 'sqlite'],
    sequelize: ['postgresql', 'mysql', 'sqlite'],
    mongoose: ['mongodb'],
    none: ['postgresql', 'mysql', 'mongodb', 'sqlite', 'none'],
};
// Get compatible ORMs for a database
function getCompatibleORMs(database) {
    if (database === 'none')
        return ['none'];
    return Object.entries(exports.ORM_DATABASE_COMPATIBILITY)
        .filter(([_, dbs]) => dbs.includes(database))
        .map(([orm]) => orm);
}
// Get state management options based on frontend
function getStateManagementOptions(frontend) {
    switch (frontend) {
        case 'vue':
            return exports.STATE_MANAGEMENT_VUE;
        case 'react':
        case 'nextjs':
            return exports.STATE_MANAGEMENT_REACT;
        default:
            return [{ name: 'None', value: 'none' }];
    }
}
//# sourceMappingURL=index.js.map