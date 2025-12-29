"use strict";
// ============================================
// Fastify Backend Generator
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyGenerator = void 0;
const path_1 = __importDefault(require("path"));
const base_js_1 = require("../base.js");
const index_js_1 = require("../../utils/index.js");
class FastifyGenerator extends base_js_1.BaseGenerator {
    name = 'Fastify';
    async generate() {
        await this.createFolderStructure(this.backendPath, [
            'src/routes',
            'src/plugins',
            'src/services',
            'src/schemas',
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
            this.generatePlugins(),
            this.generateSchemas(),
            this.generateConfig(),
            this.generateEnvExample(),
            this.generateEslintConfig(),
            this.generatePrettierConfig(),
        ]);
    }
    async generatePackageJson() {
        const isTs = this.isTypeScript;
        const dependencies = {
            fastify: '^4.26.2',
            '@fastify/cors': '^9.0.1',
            '@fastify/helmet': '^11.1.1',
            '@fastify/sensible': '^5.6.0',
            '@fastify/env': '^4.3.0',
            'fastify-plugin': '^4.5.1',
            dotenv: '^16.4.5',
        };
        const devDependencies = {
            '@types/node': '^20.11.30',
            eslint: '^8.57.0',
            prettier: '^3.2.5',
        };
        if (isTs) {
            Object.assign(devDependencies, {
                typescript: '^5.4.3',
                tsx: '^4.7.1',
                '@typescript-eslint/eslint-plugin': '^7.4.0',
                '@typescript-eslint/parser': '^7.4.0',
            });
        }
        else {
            devDependencies['nodemon'] = '^3.1.0';
        }
        if (this.config.backend.auth === 'jwt') {
            dependencies['@fastify/jwt'] = '^8.0.0';
            dependencies['bcryptjs'] = '^2.4.3';
            if (isTs)
                devDependencies['@types/bcryptjs'] = '^2.4.6';
        }
        const pkg = {
            name: `${this.config.projectName}-backend`,
            version: '1.0.0',
            description: `Backend for ${this.config.projectName}`,
            main: isTs ? 'dist/index.js' : 'src/index.js',
            type: 'module',
            scripts: {
                dev: isTs ? 'tsx watch src/index.ts' : 'nodemon src/index.js',
                build: isTs ? 'tsc' : 'echo "No build step"',
                start: isTs ? 'node dist/index.js' : 'node src/index.js',
                lint: `eslint src --ext .${this.ext}`,
                format: `prettier --write "src/**/*.${this.ext}"`,
            },
            dependencies,
            devDependencies,
        };
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.backendPath, 'package.json'), pkg);
    }
    async generateTsConfig() {
        if (!this.isTypeScript)
            return;
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
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.backendPath, 'tsconfig.json'), tsConfig);
    }
    async generateMainEntry() {
        const content = this.isTypeScript
            ? `import { buildApp } from './app.js';
import { config } from './config/index.js';

const start = async (): Promise<void> => {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(\`🚀 Server running on http://localhost:\${config.port}\`);
    console.log(\`📚 Health check: http://localhost:\${config.port}/health\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
`
            : `import { buildApp } from './app.js';
import { config } from './config/index.js';

const start = async () => {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(\`🚀 Server running on http://localhost:\${config.port}\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', `index.${this.ext}`), content);
    }
    async generateApp() {
        const content = this.isTypeScript
            ? `import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { config } from './config/index.js';
import healthRoutes from './routes/health.js';
import apiRoutes from './routes/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.nodeEnv !== 'test',
  });

  // Register plugins
  await app.register(helmet);
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });
  await app.register(sensible);

  // Register routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(apiRoutes, { prefix: '/api' });

  return app;
}
`
            : `import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { config } from './config/index.js';
import healthRoutes from './routes/health.js';
import apiRoutes from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv !== 'test',
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });
  await app.register(sensible);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(apiRoutes, { prefix: '/api' });

  return app;
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', `app.${this.ext}`), content);
    }
    async generateRoutes() {
        // Health route
        const healthRoute = this.isTypeScript
            ? `import { FastifyPluginAsync } from 'fastify';
import { healthSchema } from '../schemas/health.js';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', { schema: healthSchema }, async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  });
};

export default healthRoutes;
`
            : `import { healthSchema } from '../schemas/health.js';

export default async function healthRoutes(fastify) {
  fastify.get('/', { schema: healthSchema }, async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  });
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', 'routes', `health.${this.ext}`), healthRoute);
        // API routes
        const apiRoute = this.isTypeScript
            ? `import { FastifyPluginAsync } from 'fastify';

const apiRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return {
      message: 'API is running',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    };
  });

  // Add your routes here
  // fastify.register(usersRoutes, { prefix: '/users' });
};

export default apiRoutes;
`
            : `export default async function apiRoutes(fastify) {
  fastify.get('/', async (request, reply) => {
    return {
      message: 'API is running',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    };
  });
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', 'routes', `index.${this.ext}`), apiRoute);
    }
    async generatePlugins() {
        // Placeholder for custom plugins
        const content = this.isTypeScript
            ? `// Custom Fastify plugins go here
// Example: Authentication, Database connection, etc.

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// Example plugin
const customPlugin: FastifyPluginAsync = async (fastify, opts) => {
  // Add decorators, hooks, etc.
  fastify.decorate('config', {});
};

export default fp(customPlugin);
`
            : `// Custom Fastify plugins go here
// Example: Authentication, Database connection, etc.

export default async function customPlugin(fastify, opts) {
  // Add decorators, hooks, etc.
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', 'plugins', `index.${this.ext}`), content);
    }
    async generateSchemas() {
        const healthSchema = this.isTypeScript
            ? `export const healthSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        environment: { type: 'string' },
      },
    },
  },
} as const;
`
            : `export const healthSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        environment: { type: 'string' },
      },
    },
  },
};
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', 'schemas', `health.${this.ext}`), healthSchema);
    }
    async generateConfig() {
        const content = this.isTypeScript
            ? `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '${this.config.backend.port}', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:${this.config.frontend.port}',
  ${this.config.backend.database !== 'none' ? `databaseUrl: process.env.DATABASE_URL || '',` : ''}
  ${this.config.backend.auth === 'jwt' ? `jwtSecret: process.env.JWT_SECRET || 'your-secret-key',` : ''}
} as const;

export type Config = typeof config;
`
            : `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '${this.config.backend.port}', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:${this.config.frontend.port}',
  ${this.config.backend.database !== 'none' ? `databaseUrl: process.env.DATABASE_URL || '',` : ''}
  ${this.config.backend.auth === 'jwt' ? `jwtSecret: process.env.JWT_SECRET || 'your-secret-key',` : ''}
};
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, 'src', 'config', `index.${this.ext}`), content);
    }
    async generateEnvExample() {
        let content = `NODE_ENV=development
PORT=${this.config.backend.port}
CORS_ORIGIN=http://localhost:${this.config.frontend.port}
`;
        if (this.config.backend.database !== 'none') {
            content += `\nDATABASE_URL=your-database-url-here\n`;
        }
        if (this.config.backend.auth === 'jwt') {
            content += `\nJWT_SECRET=your-super-secret-key\n`;
        }
        await (0, index_js_1.writeFile)(path_1.default.join(this.backendPath, '.env.example'), content);
    }
    async generateEslintConfig() {
        const config = {
            root: true,
            parser: this.isTypeScript ? '@typescript-eslint/parser' : undefined,
            plugins: this.isTypeScript ? ['@typescript-eslint'] : undefined,
            extends: ['eslint:recommended', ...(this.isTypeScript ? ['plugin:@typescript-eslint/recommended'] : [])],
            env: { node: true, es2022: true },
            rules: { 'no-console': 'warn' },
        };
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.backendPath, '.eslintrc.json'), config);
    }
    async generatePrettierConfig() {
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.backendPath, '.prettierrc'), {
            semi: true,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: 'es5',
            printWidth: 100,
        });
    }
}
exports.FastifyGenerator = FastifyGenerator;
//# sourceMappingURL=fastify.js.map