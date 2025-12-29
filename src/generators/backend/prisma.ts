// ============================================
// Prisma ORM Generator
// ============================================

import path from 'path';
import { BaseGenerator } from '../base.js';
import { writeFile, writeJsonFile, ensureDir, readJsonFile } from '../../utils/index.js';
import type { ProjectConfig } from '../../types/index.js';

interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export class PrismaGenerator extends BaseGenerator {
  name = 'Prisma';

  async generate(): Promise<void> {
    await ensureDir(path.join(this.backendPath, 'prisma'));
    
    await Promise.all([
      this.generatePrismaSchema(),
      this.generatePrismaClient(),
      this.updatePackageJson(),
    ]);
  }

  private getDatasourceProvider(): string {
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

  private async generatePrismaSchema(): Promise<void> {
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

    await writeFile(path.join(this.backendPath, 'prisma', 'schema.prisma'), content);
  }

  private async generatePrismaClient(): Promise<void> {
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
    await ensureDir(path.join(this.backendPath, 'src', 'lib'));
    await writeFile(
      path.join(this.backendPath, 'src', 'lib', `prisma.${this.ext}`),
      content
    );
  }

  private async updatePackageJson(): Promise<void> {
    // Read existing package.json and add Prisma
    const pkgPath = path.join(this.backendPath, 'package.json');
    
    try {
      const pkg = await readJsonFile<PackageJson>(pkgPath);
      
      // Add Prisma dependencies
      pkg.dependencies = pkg.dependencies || {};
      pkg.devDependencies = pkg.devDependencies || {};
      
      pkg.dependencies['@prisma/client'] = '^6.2.0';
      pkg.devDependencies['prisma'] = '^6.2.0';
      
      // Add Prisma scripts
      pkg.scripts = pkg.scripts || {};
      pkg.scripts['prisma:generate'] = 'prisma generate';
      pkg.scripts['prisma:push'] = 'prisma db push';
      pkg.scripts['prisma:migrate'] = 'prisma migrate dev';
      pkg.scripts['prisma:studio'] = 'prisma studio';
      pkg.scripts['prisma:seed'] = this.isTypeScript 
        ? 'tsx prisma/seed.ts' 
        : 'node prisma/seed.js';
      
      await writeJsonFile(pkgPath, pkg);
    } catch (err) {
      // Log error for debugging
      console.error('Failed to update package.json with Prisma:', err);
    }
  }
}
