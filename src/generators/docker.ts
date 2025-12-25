// ============================================
// Docker Configuration Generator
// ============================================

import path from 'path';
import { BaseGenerator } from './base.js';
import { writeFile, ensureDir } from '../utils/index.js';
import type { ProjectConfig } from '../types/index.js';

export class DockerGenerator extends BaseGenerator {
  name = 'Docker';

  async generate(): Promise<void> {
    if (!this.config.docker) return;

    await ensureDir(path.join(this.config.rootPath, 'docker'));

    await Promise.all([
      this.generateBackendDockerfile(),
      this.generateFrontendDockerfile(),
      this.generateDockerCompose(),
      this.generateNginxConfig(),
      this.generateDockerIgnore(),
    ]);
  }

  private async generateBackendDockerfile(): Promise<void> {
    const isNestJS = this.config.backend.framework === 'nestjs';
    const pm = this.config.packageManager;
    const lockFile =
      pm === 'pnpm' ? 'pnpm-lock.yaml' : pm === 'yarn' ? 'yarn.lock' : 'package-lock.json';

    const content = `# ============================================
# Backend Dockerfile
# Multi-stage build for production
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm if needed
${pm === 'pnpm' ? 'RUN npm install -g pnpm' : ''}

# Copy package files
COPY package.json ${lockFile} ./
${this.config.backend.orm === 'prisma' ? 'COPY prisma ./prisma/' : ''}

# Install dependencies
RUN ${pm === 'pnpm' ? 'pnpm install --frozen-lockfile' : pm === 'yarn' ? 'yarn install --frozen-lockfile' : 'npm ci'}

# Copy source code
COPY . .

# Generate Prisma client if needed
${this.config.backend.orm === 'prisma' ? `RUN ${pm === 'pnpm' ? 'pnpm' : pm === 'yarn' ? 'yarn' : 'npx'} prisma generate` : ''}

# Build the application
RUN ${pm === 'pnpm' ? 'pnpm' : pm === 'yarn' ? 'yarn' : 'npm run'} build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Install pnpm if needed
${pm === 'pnpm' ? 'RUN npm install -g pnpm' : ''}

# Copy package files
COPY package.json ${lockFile} ./
${this.config.backend.orm === 'prisma' ? 'COPY prisma ./prisma/' : ''}

# Install production dependencies only
RUN ${pm === 'pnpm' ? 'pnpm install --frozen-lockfile --prod' : pm === 'yarn' ? 'yarn install --frozen-lockfile --production' : 'npm ci --only=production'}

# Generate Prisma client if needed
${this.config.backend.orm === 'prisma' ? `RUN ${pm === 'pnpm' ? 'pnpm' : pm === 'yarn' ? 'yarn' : 'npx'} prisma generate` : ''}

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE ${this.config.backend.port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${this.config.backend.port}/health || exit 1

# Start the application
CMD ["node", "dist/${isNestJS ? 'main' : 'index'}.js"]
`;

    await writeFile(
      path.join(this.config.rootPath, 'docker', 'Dockerfile.backend'),
      content
    );
  }

  private async generateFrontendDockerfile(): Promise<void> {
    if (this.config.frontend.framework === 'none') return;

    const pm = this.config.packageManager;
    const lockFile =
      pm === 'pnpm' ? 'pnpm-lock.yaml' : pm === 'yarn' ? 'yarn.lock' : 'package-lock.json';
    const isNextJS = this.config.frontend.framework === 'nextjs';

    const content = `# ============================================
# Frontend Dockerfile
# Multi-stage build for production
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm if needed
${pm === 'pnpm' ? 'RUN npm install -g pnpm' : ''}

# Copy package files
COPY package.json ${lockFile} ./

# Install dependencies
RUN ${pm === 'pnpm' ? 'pnpm install --frozen-lockfile' : pm === 'yarn' ? 'yarn install --frozen-lockfile' : 'npm ci'}

# Copy source code
COPY . .

# Build the application
RUN ${pm === 'pnpm' ? 'pnpm' : pm === 'yarn' ? 'yarn' : 'npm run'} build

${
  isNextJS
    ? `# Production stage for Next.js
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE ${this.config.frontend.port}

ENV PORT ${this.config.frontend.port}
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]`
    : `# Production stage for static files
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`
}
`;

    await writeFile(
      path.join(this.config.rootPath, 'docker', 'Dockerfile.frontend'),
      content
    );
  }

  private async generateDockerCompose(): Promise<void> {
    const hasDatabase = this.config.backend.database !== 'none';
    const hasFrontend = this.config.frontend.framework !== 'none';

    let services = '';

    // Backend service
    services += `
  backend:
    build:
      context: ./${this.config.structure === 'monorepo' ? 'apps/backend' : 'backend'}
      dockerfile: ../docker/Dockerfile.backend
    container_name: ${this.config.projectName}-backend
    restart: unless-stopped
    ports:
      - "\${BACKEND_PORT:-${this.config.backend.port}}:${this.config.backend.port}"
    environment:
      - NODE_ENV=production
      - PORT=${this.config.backend.port}
      ${hasDatabase ? '- DATABASE_URL=${DATABASE_URL}' : ''}
      ${this.config.backend.auth === 'jwt' ? '- JWT_SECRET=${JWT_SECRET}' : ''}
    ${hasDatabase ? `depends_on:
      - database` : ''}
    networks:
      - app-network
`;

    // Frontend service
    if (hasFrontend) {
      services += `
  frontend:
    build:
      context: ./${this.config.structure === 'monorepo' ? 'apps/frontend' : 'frontend'}
      dockerfile: ../docker/Dockerfile.frontend
    container_name: ${this.config.projectName}-frontend
    restart: unless-stopped
    ports:
      - "\${FRONTEND_PORT:-${this.config.frontend.port}}:${this.config.frontend.framework === 'nextjs' ? this.config.frontend.port : '80'}"
    environment:
      - NODE_ENV=production
      ${this.config.frontend.framework === 'nextjs' ? `- NEXT_PUBLIC_API_URL=http://backend:${this.config.backend.port}` : ''}
    depends_on:
      - backend
    networks:
      - app-network
`;
    }

    // Database service
    if (hasDatabase) {
      services += this.getDatabaseService();
    }

    // Nginx reverse proxy (optional)
    services += `
  nginx:
    image: nginx:alpine
    container_name: ${this.config.projectName}-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      ${hasFrontend ? '- frontend' : ''}
    networks:
      - app-network
`;

    const content = `# ============================================
# Docker Compose Configuration
# Generated by create-my-stack
# ============================================

version: '3.8'

services:${services}

networks:
  app-network:
    driver: bridge

${hasDatabase ? this.getVolumeConfig() : ''}
`;

    await writeFile(path.join(this.config.rootPath, 'docker-compose.yml'), content);

    // Docker compose for development
    await this.generateDockerComposeDev();
  }

  private getDatabaseService(): string {
    switch (this.config.backend.database) {
      case 'postgresql':
        return `
  database:
    image: postgres:16-alpine
    container_name: ${this.config.projectName}-postgres
    restart: unless-stopped
    ports:
      - "\${DB_PORT:-5432}:5432"
    environment:
      - POSTGRES_USER=\${DB_USER:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD:-postgres}
      - POSTGRES_DB=\${DB_NAME:-${this.config.projectName.replace(/-/g, '_')}}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
`;

      case 'mysql':
        return `
  database:
    image: mysql:8
    container_name: ${this.config.projectName}-mysql
    restart: unless-stopped
    ports:
      - "\${DB_PORT:-3306}:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${DB_ROOT_PASSWORD:-root}
      - MYSQL_DATABASE=\${DB_NAME:-${this.config.projectName.replace(/-/g, '_')}}
      - MYSQL_USER=\${DB_USER:-user}
      - MYSQL_PASSWORD=\${DB_PASSWORD:-password}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
`;

      case 'mongodb':
        return `
  database:
    image: mongo:7
    container_name: ${this.config.projectName}-mongodb
    restart: unless-stopped
    ports:
      - "\${DB_PORT:-27017}:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=\${DB_USER:-admin}
      - MONGO_INITDB_ROOT_PASSWORD=\${DB_PASSWORD:-password}
      - MONGO_INITDB_DATABASE=\${DB_NAME:-${this.config.projectName.replace(/-/g, '_')}}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
`;

      default:
        return '';
    }
  }

  private getVolumeConfig(): string {
    switch (this.config.backend.database) {
      case 'postgresql':
        return `volumes:
  postgres_data:
`;
      case 'mysql':
        return `volumes:
  mysql_data:
`;
      case 'mongodb':
        return `volumes:
  mongodb_data:
`;
      default:
        return '';
    }
  }

  private async generateDockerComposeDev(): Promise<void> {
    const hasDatabase = this.config.backend.database !== 'none';

    let services = '';

    if (hasDatabase) {
      services = this.getDatabaseService();
    }

    // Redis for session (if needed)
    if (this.config.backend.auth === 'session') {
      services += `
  redis:
    image: redis:7-alpine
    container_name: ${this.config.projectName}-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network
`;
    }

    const content = `# ============================================
# Docker Compose for Development
# Only database services - app runs locally
# ============================================

version: '3.8'

services:${services}

networks:
  app-network:
    driver: bridge

${hasDatabase ? this.getVolumeConfig() : ''}${this.config.backend.auth === 'session' ? `  redis_data:
` : ''}
`;

    await writeFile(path.join(this.config.rootPath, 'docker-compose.dev.yml'), content);
  }

  private async generateNginxConfig(): Promise<void> {
    const hasFrontend = this.config.frontend.framework !== 'none';

    const content = `# ============================================
# Nginx Configuration
# Reverse proxy for backend and frontend
# ============================================

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    # Performance
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

    # Upstream servers
    upstream backend {
        server backend:${this.config.backend.port};
        keepalive 32;
    }

    ${hasFrontend ? `upstream frontend {
        server frontend:${this.config.frontend.framework === 'nextjs' ? this.config.frontend.port : '80'};
        keepalive 32;
    }` : ''}

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API routes
        location /api {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 90;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://backend/health;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }

        ${hasFrontend ? `# Frontend routes
        location / {
            limit_req zone=general_limit burst=50 nodelay;

            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }` : `# Default response for backend-only
        location / {
            return 301 /api;
        }`}
    }

    # HTTPS server (uncomment and configure SSL)
    # server {
    #     listen 443 ssl http2;
    #     server_name localhost;
    #
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    #     ssl_prefer_server_ciphers off;
    #
    #     # ... same location blocks as above
    # }
}
`;

    await writeFile(path.join(this.config.rootPath, 'docker', 'nginx.conf'), content);

    // Frontend-specific nginx config for static builds
    if (hasFrontend && this.config.frontend.framework !== 'nextjs') {
      const frontendNginx = `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend:${this.config.backend.port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
`;

      await writeFile(
        path.join(this.config.rootPath, 'docker', 'nginx.frontend.conf'),
        frontendNginx
      );
    }
  }

  private async generateDockerIgnore(): Promise<void> {
    const content = `# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
build
.next
out

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test
coverage
.nyc_output

# Misc
.git
.gitignore
README.md
*.md
docker-compose*.yml
Dockerfile*
`;

    await writeFile(path.join(this.config.rootPath, '.dockerignore'), content);

    // Also create in backend/frontend folders
    if (this.config.structure === 'monorepo') {
      await writeFile(path.join(this.config.backendPath, '.dockerignore'), content);
      if (this.config.frontend.framework !== 'none') {
        await writeFile(path.join(this.config.frontendPath, '.dockerignore'), content);
      }
    }
  }
}
