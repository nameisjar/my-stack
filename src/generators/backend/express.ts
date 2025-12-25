// ============================================
// Express.js Backend Generator
// ============================================

import path from 'path';
import { BaseGenerator } from '../base.js';
import type { ProjectConfig } from '../../types/index.js';
import { writeFile, writeJsonFile, ensureDir } from '../../utils/index.js';

export class ExpressGenerator extends BaseGenerator {
  name = 'Express.js';

  async generate(): Promise<void> {
    await this.createFolderStructure(this.backendPath, [
      'src/routes',
      'src/controllers',
      'src/services',
      'src/middlewares',
      'src/config',
      'src/utils',
      'src/types',
    ]);

    await Promise.all([
      this.generatePackageJson(),
      this.generateTsConfig(),
      this.generateMainEntry(),
      this.generateApp(),
      this.generateRoutes(),
      this.generateControllers(),
      this.generateMiddlewares(),
      this.generateConfig(),
      this.generateEnvExample(),
      this.generateEslintConfig(),
      this.generatePrettierConfig(),
    ]);
  }

  private async generatePackageJson(): Promise<void> {
    const isTs = this.isTypeScript;
    
    const dependencies: Record<string, string> = {
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.1.0',
      morgan: '^1.10.0',
      dotenv: '^16.4.5',
    };

    const devDependencies: Record<string, string> = {
      '@types/node': '^20.11.30',
      eslint: '^8.57.0',
      prettier: '^3.2.5',
    };

    if (isTs) {
      Object.assign(devDependencies, {
        typescript: '^5.4.3',
        tsx: '^4.7.1',
        '@types/express': '^4.17.21',
        '@types/cors': '^2.8.17',
        '@types/morgan': '^1.9.9',
        '@typescript-eslint/eslint-plugin': '^7.4.0',
        '@typescript-eslint/parser': '^7.4.0',
      });
    } else {
      Object.assign(devDependencies, {
        nodemon: '^3.1.0',
      });
    }

    // Auth dependencies
    if (this.config.backend.auth === 'jwt') {
      dependencies['jsonwebtoken'] = '^9.0.2';
      dependencies['bcryptjs'] = '^2.4.3';
      if (isTs) {
        devDependencies['@types/jsonwebtoken'] = '^9.0.6';
        devDependencies['@types/bcryptjs'] = '^2.4.6';
      }
    } else if (this.config.backend.auth === 'session') {
      dependencies['express-session'] = '^1.18.0';
      dependencies['connect-redis'] = '^7.1.1';
      if (isTs) {
        devDependencies['@types/express-session'] = '^1.18.0';
      }
    }

    const pkg = {
      name: `${this.config.projectName}-backend`,
      version: '1.0.0',
      description: `Backend for ${this.config.projectName}`,
      main: isTs ? 'dist/index.js' : 'src/index.js',
      scripts: {
        dev: isTs ? 'tsx watch src/index.ts' : 'nodemon src/index.js',
        build: isTs ? 'tsc' : 'echo "No build step for JavaScript"',
        start: isTs ? 'node dist/index.js' : 'node src/index.js',
        lint: `eslint src --ext .${this.ext}`,
        format: `prettier --write "src/**/*.${this.ext}"`,
      },
      dependencies,
      devDependencies,
    };

    await writeJsonFile(path.join(this.backendPath, 'package.json'), pkg);
  }

  private async generateTsConfig(): Promise<void> {
    if (!this.isTypeScript) return;

    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        lib: ['ES2022'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };

    await writeJsonFile(path.join(this.backendPath, 'tsconfig.json'), tsConfig);
  }

  private async generateMainEntry(): Promise<void> {
    const content = this.isTypeScript
      ? `import app from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`📚 Health check: http://localhost:\${PORT}/health\`);
});
`
      : `const app = require('./app');
const { config } = require('./config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`📚 Health check: http://localhost:\${PORT}/health\`);
});
`;

    await writeFile(path.join(this.backendPath, 'src', `index.${this.ext}`), content);
  }

  private async generateApp(): Promise<void> {
    const content = this.isTypeScript
      ? `import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';
import healthRouter from './routes/health.js';
import apiRouter from './routes/index.js';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Routes
app.use('/health', healthRouter);
app.use('/api', apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
`
      : `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config } = require('./config');
const { errorHandler, notFoundHandler } = require('./middlewares/error');
const healthRouter = require('./routes/health');
const apiRouter = require('./routes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Routes
app.use('/health', healthRouter);
app.use('/api', apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
`;

    await writeFile(path.join(this.backendPath, 'src', `app.${this.ext}`), content);
  }

  private async generateRoutes(): Promise<void> {
    // Health route
    const healthRoute = this.isTypeScript
      ? `import { Router } from 'express';
import { healthCheck } from '../controllers/health.js';

const router = Router();

router.get('/', healthCheck);

export default router;
`
      : `const { Router } = require('express');
const { healthCheck } = require('../controllers/health');

const router = Router();

router.get('/', healthCheck);

module.exports = router;
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'routes', `health.${this.ext}`),
      healthRoute
    );

    // Main API router
    const indexRoute = this.isTypeScript
      ? `import { Router } from 'express';

const router = Router();

// Add your API routes here
// router.use('/users', usersRouter);
// router.use('/posts', postsRouter);

router.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

export default router;
`
      : `const { Router } = require('express');

const router = Router();

// Add your API routes here
// router.use('/users', usersRouter);
// router.use('/posts', postsRouter);

router.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

module.exports = router;
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'routes', `index.${this.ext}`),
      indexRoute
    );
  }

  private async generateControllers(): Promise<void> {
    const healthController = this.isTypeScript
      ? `import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};
`
      : `const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};

module.exports = { healthCheck };
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'controllers', `health.${this.ext}`),
      healthController
    );
  }

  private async generateMiddlewares(): Promise<void> {
    const errorMiddleware = this.isTypeScript
      ? `import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: AppError = new Error(\`Not found - \${req.originalUrl}\`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
`
      : `const notFoundHandler = (req, res, next) => {
  const error = new Error(\`Not found - \${req.originalUrl}\`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'middlewares', `error.${this.ext}`),
      errorMiddleware
    );
  }

  private async generateConfig(): Promise<void> {
    const configContent = this.isTypeScript
      ? `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '${this.config.backend.port}', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:${this.config.frontend.port}',
  ${this.config.backend.database !== 'none' ? `databaseUrl: process.env.DATABASE_URL || '',` : ''}
  ${this.config.backend.auth === 'jwt' ? `jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',` : ''}
} as const;

export type Config = typeof config;
`
      : `require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '${this.config.backend.port}', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:${this.config.frontend.port}',
  ${this.config.backend.database !== 'none' ? `databaseUrl: process.env.DATABASE_URL || '',` : ''}
  ${this.config.backend.auth === 'jwt' ? `jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',` : ''}
};

module.exports = { config };
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'config', `index.${this.ext}`),
      configContent
    );
  }

  private async generateEnvExample(): Promise<void> {
    let envContent = `# Application
NODE_ENV=development
PORT=${this.config.backend.port}
CORS_ORIGIN=http://localhost:${this.config.frontend.port}
`;

    if (this.config.backend.database !== 'none') {
      const dbExamples: Record<string, string> = {
        postgresql: 'postgresql://user:password@localhost:5432/mydb',
        mysql: 'mysql://user:password@localhost:3306/mydb',
        mongodb: 'mongodb://localhost:27017/mydb',
        sqlite: 'file:./dev.db',
      };
      envContent += `
# Database
DATABASE_URL="${dbExamples[this.config.backend.database] || ''}"
`;
    }

    if (this.config.backend.auth === 'jwt') {
      envContent += `
# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
`;
    }

    if (this.config.backend.auth === 'session') {
      envContent += `
# Session
SESSION_SECRET=your-session-secret-change-in-production
REDIS_URL=redis://localhost:6379
`;
    }

    await writeFile(path.join(this.backendPath, '.env.example'), envContent);
  }

  private async generateEslintConfig(): Promise<void> {
    const eslintConfig = {
      root: true,
      parser: this.isTypeScript ? '@typescript-eslint/parser' : undefined,
      plugins: this.isTypeScript ? ['@typescript-eslint'] : undefined,
      extends: [
        'eslint:recommended',
        ...(this.isTypeScript ? ['plugin:@typescript-eslint/recommended'] : []),
      ],
      env: {
        node: true,
        es2022: true,
      },
      rules: {
        'no-console': 'warn',
        ...(this.isTypeScript && {
          '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        }),
      },
    };

    await writeJsonFile(path.join(this.backendPath, '.eslintrc.json'), eslintConfig);
  }

  private async generatePrettierConfig(): Promise<void> {
    const prettierConfig = {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
    };

    await writeJsonFile(path.join(this.backendPath, '.prettierrc'), prettierConfig);
  }
}
