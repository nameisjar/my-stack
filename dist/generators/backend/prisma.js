"use strict";
// ============================================
// Prisma ORM Generator
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaGenerator = void 0;
const path_1 = __importDefault(require("path"));
const base_js_1 = require("../base.js");
const index_js_1 = require("../../utils/index.js");
class PrismaGenerator extends base_js_1.BaseGenerator {
    name = 'Prisma';
    async generate() {
        await (0, index_js_1.ensureDir)(path_1.default.join(this.backendPath, 'prisma'));
        await Promise.all([
            this.generatePrismaSchema(),
            this.generatePrismaClient(),
            this.updatePackageJson(),
        ]);
    }
    getDatasourceProvider() {
        switch (this.config.backend.database) {
            case 'postgresql':
                return 'postgresql';
            case 'mysql':
                return 'mysql';
            case 'mongodb':
                return 'mongodb';
            case 'sqlite':
                return 'sqlite';
            default:
                return 'postgresql';
        }
    }
    async generatePrismaSchema() {
        const provider = this.getDatasourceProvider();
        const isMongo = provider === 'mongodb';
        const content = `// Prisma Schema
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

// Example User model
model User {
  id        ${isMongo ? 'String @id @default(auto()) @map("_id") @db.ObjectId' : 'Int    @id @default(autoincrement())'}
  email     String   @unique
  name      String?
  password  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ${!isMongo ? 'posts     Post[]' : ''}
}

${!isMongo ? `// Example Post model
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}` : ''}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'prisma', 'schema.prisma'), content);
    }
    async generatePrismaClient() {
        const content = this.isTypeScript
            ? `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
`
            : `const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = { prisma };
`;
        // Create the lib directory
        await (0, index_js_1.ensureDir)(path_1.default.join(this.backendPath, 'src', 'lib'));
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', 'lib', `prisma.${this.ext}`), content);
    }
    async updatePackageJson() {
        // Read existing package.json and add Prisma
        const pkgPath = path_1.default.join(this.backendPath, 'package.json');
        try {
            const fs = await import('fs-extra');
            const pkg = await fs.readJson(pkgPath);
            // Add Prisma dependencies
            pkg.dependencies = pkg.dependencies || {};
            pkg.devDependencies = pkg.devDependencies || {};
            pkg.dependencies['@prisma/client'] = '^5.11.0';
            pkg.devDependencies['prisma'] = '^5.11.0';
            // Add Prisma scripts
            pkg.scripts = pkg.scripts || {};
            pkg.scripts['db:generate'] = 'prisma generate';
            pkg.scripts['db:push'] = 'prisma db push';
            pkg.scripts['db:migrate'] = 'prisma migrate dev';
            pkg.scripts['db:studio'] = 'prisma studio';
            pkg.scripts['db:seed'] = this.isTypeScript
                ? 'tsx prisma/seed.ts'
                : 'node prisma/seed.js';
            await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        }
        catch {
            // Package.json doesn't exist yet, will be created by backend generator
        }
    }
}
exports.PrismaGenerator = PrismaGenerator;
//# sourceMappingURL=prisma.js.map