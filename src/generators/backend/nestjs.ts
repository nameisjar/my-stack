// ============================================
// NestJS Backend Generator
// ============================================

import path from 'path';
import { BaseGenerator } from '../base.js';
import { writeFile, writeJsonFile } from '../../utils/index.js';

export class NestJSGenerator extends BaseGenerator {
  name = 'NestJS';

  // NestJS is always TypeScript
  protected override get isTypeScript(): boolean {
    return true;
  }

  async generate(): Promise<void> {
    await this.createFolderStructure(this.backendPath, [
      'src/common/decorators',
      'src/common/filters',
      'src/common/guards',
      'src/common/interceptors',
      'src/common/pipes',
      'src/config',
      'src/health',
      'src/modules',
    ]);

    await Promise.all([
      this.generatePackageJson(),
      this.generateTsConfig(),
      this.generateNestCliConfig(),
      this.generateMain(),
      this.generateAppModule(),
      this.generateAppController(),
      this.generateAppService(),
      this.generateHealthModule(),
      this.generateConfigModule(),
      this.generateCommonFiles(),
      this.generateEnvExample(),
      this.generateEslintConfig(),
      this.generatePrettierConfig(),
    ]);
  }

  private async generatePackageJson(): Promise<void> {
    const dependencies: Record<string, string> = {
      '@nestjs/common': '^10.3.3',
      '@nestjs/core': '^10.3.3',
      '@nestjs/platform-express': '^10.3.3',
      '@nestjs/config': '^3.2.0',
      '@nestjs/terminus': '^10.2.3',
      'class-transformer': '^0.5.1',
      'class-validator': '^0.14.1',
      'reflect-metadata': '^0.2.1',
      rxjs: '^7.8.1',
    };

    const devDependencies: Record<string, string> = {
      '@nestjs/cli': '^10.3.2',
      '@nestjs/schematics': '^10.1.1',
      '@nestjs/testing': '^10.3.3',
      '@types/express': '^4.17.21',
      '@types/node': '^20.11.30',
      '@typescript-eslint/eslint-plugin': '^7.4.0',
      '@typescript-eslint/parser': '^7.4.0',
      eslint: '^8.57.0',
      'eslint-config-prettier': '^9.1.0',
      'eslint-plugin-prettier': '^5.1.3',
      prettier: '^3.2.5',
      'source-map-support': '^0.5.21',
      'ts-loader': '^9.5.1',
      'ts-node': '^10.9.2',
      'tsconfig-paths': '^4.2.0',
      typescript: '^5.4.3',
    };

    if (this.config.backend.auth === 'jwt') {
      dependencies['@nestjs/jwt'] = '^10.2.0';
      dependencies['@nestjs/passport'] = '^10.0.3';
      dependencies['passport'] = '^0.7.0';
      dependencies['passport-jwt'] = '^4.0.1';
      dependencies['bcryptjs'] = '^2.4.3';
      devDependencies['@types/passport-jwt'] = '^4.0.1';
      devDependencies['@types/bcryptjs'] = '^2.4.6';
    }

    const pkg = {
      name: `${this.config.projectName}-backend`,
      version: '1.0.0',
      description: `Backend for ${this.config.projectName}`,
      scripts: {
        build: 'nest build',
        format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
        start: 'nest start',
        dev: 'nest start --watch',
        'start:debug': 'nest start --debug --watch',
        'start:prod': 'node dist/main',
        lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:cov': 'jest --coverage',
        'test:e2e': 'jest --config ./test/jest-e2e.json',
      },
      dependencies,
      devDependencies,
    };

    await writeJsonFile(path.join(this.backendPath, 'package.json'), pkg);
  }

  private async generateTsConfig(): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        module: 'commonjs',
        declaration: true,
        removeComments: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: 'ES2021',
        sourceMap: true,
        outDir: './dist',
        baseUrl: './',
        incremental: true,
        skipLibCheck: true,
        strictNullChecks: true,
        noImplicitAny: true,
        strictBindCallApply: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        paths: {
          '@/*': ['src/*'],
        },
      },
    };

    await writeJsonFile(path.join(this.backendPath, 'tsconfig.json'), tsConfig);

    const tsBuild = {
      extends: './tsconfig.json',
      exclude: ['node_modules', 'test', 'dist', '**/*spec.ts'],
    };

    await writeJsonFile(path.join(this.backendPath, 'tsconfig.build.json'), tsBuild);
  }

  private async generateNestCliConfig(): Promise<void> {
    const config = {
      $schema: 'https://json.schemastore.org/nest-cli',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
      compilerOptions: {
        deleteOutDir: true,
      },
    };

    await writeJsonFile(path.join(this.backendPath, 'nest-cli.json'), config);
  }

  private async generateMain(): Promise<void> {
    const content = `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:${this.config.frontend.port}'),
    credentials: true,
  });
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const port = configService.get('PORT', ${this.config.backend.port});
  await app.listen(port);
  
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
  console.log(\`📚 Health check: http://localhost:\${port}/api/health\`);
}

bootstrap();
`;

    await writeFile(path.join(this.backendPath, 'src', 'main.ts'), content);
  }

  private async generateAppModule(): Promise<void> {
    const content = `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

    await writeFile(path.join(this.backendPath, 'src', 'app.module.ts'), content);
  }

  private async generateAppController(): Promise<void> {
    const content = `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }
}
`;

    await writeFile(path.join(this.backendPath, 'src', 'app.controller.ts'), content);
  }

  private async generateAppService(): Promise<void> {
    const content = `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      message: 'API is running',
      version: '1.0.0',
      framework: 'NestJS',
      endpoints: {
        health: '/api/health',
        api: '/api',
      },
    };
  }
}
`;

    await writeFile(path.join(this.backendPath, 'src', 'app.service.ts'), content);
  }

  private async generateHealthModule(): Promise<void> {
    // Health Module
    const module = `import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
`;

    await writeFile(path.join(this.backendPath, 'src', 'health', 'health.module.ts'), module);

    // Health Controller
    const controller = `import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('ping')
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
`;

    await writeFile(path.join(this.backendPath, 'src', 'health', 'health.controller.ts'), controller);
  }

  private async generateConfigModule(): Promise<void> {
    const content = `export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '${this.config.backend.port}', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:${this.config.frontend.port}',
  ${this.config.backend.database !== 'none' ? `database: {
    url: process.env.DATABASE_URL,
  },` : ''}
  ${this.config.backend.auth === 'jwt' ? `jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },` : ''}
});
`;

    await writeFile(path.join(this.backendPath, 'src', 'config', 'configuration.ts'), content);
  }

  private async generateCommonFiles(): Promise<void> {
    // HTTP Exception Filter
    const exceptionFilter = `import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...error,
    });
  }
}
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'common', 'filters', 'http-exception.filter.ts'),
      exceptionFilter
    );

    // Transform Interceptor
    const transformInterceptor = `import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'common', 'interceptors', 'transform.interceptor.ts'),
      transformInterceptor
    );
  }

  private async generateEnvExample(): Promise<void> {
    let content = `# Application
NODE_ENV=development
PORT=${this.config.backend.port}
CORS_ORIGIN=http://localhost:${this.config.frontend.port}
`;

    if (this.config.backend.database !== 'none') {
      content += `\n# Database\nDATABASE_URL=your-database-url\n`;
    }

    if (this.config.backend.auth === 'jwt') {
      content += `\n# JWT\nJWT_SECRET=your-super-secret-key\nJWT_EXPIRES_IN=7d\n`;
    }

    await writeFile(path.join(this.backendPath, '.env.example'), content);
  }

  private async generateEslintConfig(): Promise<void> {
    const config = {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: '__dirname',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      root: true,
      env: {
        node: true,
        jest: true,
      },
      ignorePatterns: ['.eslintrc.js'],
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    };

    await writeJsonFile(path.join(this.backendPath, '.eslintrc.json'), config);
  }

  private async generatePrettierConfig(): Promise<void> {
    await writeJsonFile(path.join(this.backendPath, '.prettierrc'), {
      singleQuote: true,
      trailingComma: 'all',
    });
  }
}
