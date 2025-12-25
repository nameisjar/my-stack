"use strict";
// ============================================
// README Generator
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeGenerator = void 0;
const path_1 = __importDefault(require("path"));
const base_js_1 = require("./base.js");
const index_js_1 = require("../utils/index.js");
const package_js_1 = require("../utils/package.js");
class ReadmeGenerator extends base_js_1.BaseGenerator {
    name = 'README';
    async generate() {
        await this.generateMainReadme();
        if (this.config.structure === 'monorepo' || this.config.frontend.framework === 'none') {
            await this.generateBackendReadme();
        }
        if (this.config.frontend.framework !== 'none') {
            await this.generateFrontendReadme();
        }
    }
    async generateMainReadme() {
        const pm = this.config.packageManager;
        const runCmd = (0, package_js_1.getRunCommand)(pm);
        const installCmd = (0, package_js_1.getInstallCommand)(pm);
        const hasFrontend = this.config.frontend.framework !== 'none';
        const isMonorepo = this.config.structure === 'monorepo';
        const content = `# ${this.config.projectName}

${this.config.description}

## 🚀 Tech Stack

### Backend
- **Framework:** ${this.getFrameworkName(this.config.backend.framework)}
- **Language:** ${this.config.backend.language === 'typescript' ? 'TypeScript' : 'JavaScript'}
- **Database:** ${this.config.backend.database === 'none' ? 'None' : this.getDatabaseName(this.config.backend.database)}
- **ORM:** ${this.config.backend.orm === 'none' ? 'None' : this.getORMName(this.config.backend.orm)}
- **Authentication:** ${this.config.backend.auth === 'none' ? 'None' : this.config.backend.auth.toUpperCase()}

${hasFrontend ? `### Frontend
- **Framework:** ${this.getFrontendFrameworkName(this.config.frontend.framework)}
- **Styling:** ${this.getStylingName(this.config.frontend.styling)}
- **State Management:** ${this.config.frontend.stateManagement === 'none' ? 'None' : this.getStateManagementName(this.config.frontend.stateManagement)}
` : ''}

## 📁 Project Structure

\`\`\`
${this.config.projectName}/
${isMonorepo ? `├── apps/
│   ├── backend/          # Backend application
│   └── frontend/         # Frontend application
├── docker/               # Docker configuration
├── docker-compose.yml    # Docker compose
├── .env.example          # Environment variables template
└── README.md` : hasFrontend ? `├── backend/              # Backend application
├── frontend/             # Frontend application
├── docker/               # Docker configuration
├── docker-compose.yml    # Docker compose
├── .env.example          # Environment variables template
└── README.md` : `├── src/                  # Source code
│   ├── config/           # Configuration
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middlewares
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── docker/               # Docker configuration
├── .env.example          # Environment variables template
└── README.md`}
\`\`\`

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- ${pm === 'pnpm' ? 'pnpm' : pm === 'yarn' ? 'yarn' : 'npm'}
${this.config.backend.database !== 'none' ? `- ${this.getDatabaseName(this.config.backend.database)} (or Docker)` : ''}

### Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd ${this.config.projectName}

# Install dependencies
${installCmd}
\`\`\`

### Environment Setup

\`\`\`bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
\`\`\`

${this.config.backend.database !== 'none' ? `### Database Setup

${this.config.docker ? `#### Using Docker (Recommended)
\`\`\`bash
# Start database container
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

#### Manual Setup
` : ''}${this.getDatabaseSetupInstructions()}
` : ''}

### Running the Application

#### Development

\`\`\`bash
${isMonorepo ? `# Run all services
${runCmd} dev

# Or run individually
${runCmd} dev:backend
${runCmd} dev:frontend` : hasFrontend ? `# Backend
cd backend
${runCmd} dev

# Frontend (new terminal)
cd frontend
${runCmd} dev` : `${runCmd} dev`}
\`\`\`

#### Production Build

\`\`\`bash
${runCmd} build
${runCmd} start
\`\`\`

${this.config.docker ? `### Docker

\`\`\`bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
\`\`\`
` : ''}

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/health\` | Health check |
| GET | \`/api\` | API info |

## 🧪 Testing

\`\`\`bash
# Run tests
${runCmd} test

# Run tests with coverage
${runCmd} test:cov
\`\`\`

## 📝 Scripts

| Script | Description |
|--------|-------------|
| \`dev\` | Start development server |
| \`build\` | Build for production |
| \`start\` | Start production server |
| \`lint\` | Run ESLint |
| \`format\` | Format code with Prettier |
${this.config.backend.orm === 'prisma' ? `| \`db:generate\` | Generate Prisma client |
| \`db:push\` | Push schema to database |
| \`db:migrate\` | Run database migrations |
| \`db:studio\` | Open Prisma Studio |` : ''}

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`NODE_ENV\` | Environment | \`development\` |
| \`PORT\` | Backend port | \`${this.config.backend.port}\` |
${this.config.backend.database !== 'none' ? `| \`DATABASE_URL\` | Database connection string | - |` : ''}
${this.config.backend.auth === 'jwt' ? `| \`JWT_SECRET\` | JWT signing secret | - |
| \`JWT_EXPIRES_IN\` | JWT expiration | \`7d\` |` : ''}
${hasFrontend ? `| \`VITE_API_URL\` / \`NEXT_PUBLIC_API_URL\` | API URL for frontend | \`/api\` |` : ''}

## 📄 License

MIT

---

Generated with ❤️ by [create-my-stack](https://github.com/your-repo/create-my-stack)
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.config.rootPath, 'README.md'), content);
    }
    async generateBackendReadme() {
        const pm = this.config.packageManager;
        const runCmd = (0, package_js_1.getRunCommand)(pm);
        const content = `# ${this.config.projectName} - Backend

Backend service built with ${this.getFrameworkName(this.config.backend.framework)}.

## Quick Start

\`\`\`bash
# Install dependencies
${pm} install

# Setup environment
cp .env.example .env

${this.config.backend.orm === 'prisma' ? `# Generate Prisma client
${runCmd} db:generate

# Run migrations
${runCmd} db:migrate

` : ''}# Start development server
${runCmd} dev
\`\`\`

## Available Scripts

- \`${runCmd} dev\` - Start development server with hot reload
- \`${runCmd} build\` - Build for production
- \`${runCmd} start\` - Start production server
- \`${runCmd} lint\` - Run ESLint
- \`${runCmd} format\` - Format code with Prettier

## Project Structure

\`\`\`
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middlewares/      # Custom middlewares
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
└── index.ts          # Application entry point
\`\`\`
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.config.backendPath, 'README.md'), content);
    }
    async generateFrontendReadme() {
        if (this.config.frontend.framework === 'none')
            return;
        const pm = this.config.packageManager;
        const runCmd = (0, package_js_1.getRunCommand)(pm);
        const content = `# ${this.config.projectName} - Frontend

Frontend application built with ${this.getFrontendFrameworkName(this.config.frontend.framework)}.

## Quick Start

\`\`\`bash
# Install dependencies
${pm} install

# Setup environment
cp .env.example .env

# Start development server
${runCmd} dev
\`\`\`

## Available Scripts

- \`${runCmd} dev\` - Start development server
- \`${runCmd} build\` - Build for production
- \`${runCmd} preview\` - Preview production build
- \`${runCmd} lint\` - Run ESLint
- \`${runCmd} format\` - Format code with Prettier

## Project Structure

\`\`\`
src/
├── assets/           # Static assets
├── components/       # Reusable components
├── ${this.config.frontend.framework === 'nextjs' ? 'app/' : 'pages/'}             # ${this.config.frontend.framework === 'nextjs' ? 'App router pages' : 'Page components'}
├── services/         # API services
├── ${this.config.frontend.stateManagement !== 'none' ? 'store/' : 'hooks/'}            # ${this.config.frontend.stateManagement !== 'none' ? 'State management' : 'Custom hooks'}
└── types/            # TypeScript types
\`\`\`
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.config.frontendPath, 'README.md'), content);
    }
    getFrameworkName(framework) {
        const names = {
            express: 'Express.js',
            fastify: 'Fastify',
            nestjs: 'NestJS',
        };
        return names[framework] || framework;
    }
    getFrontendFrameworkName(framework) {
        const names = {
            vue: 'Vue 3',
            react: 'React',
            nextjs: 'Next.js',
        };
        return names[framework] || framework;
    }
    getDatabaseName(database) {
        const names = {
            postgresql: 'PostgreSQL',
            mysql: 'MySQL',
            mongodb: 'MongoDB',
            sqlite: 'SQLite',
        };
        return names[database] || database;
    }
    getORMName(orm) {
        const names = {
            prisma: 'Prisma',
            sequelize: 'Sequelize',
            mongoose: 'Mongoose',
        };
        return names[orm] || orm;
    }
    getStylingName(styling) {
        const names = {
            tailwind: 'Tailwind CSS',
            css: 'Plain CSS',
            scss: 'SCSS/Sass',
        };
        return names[styling] || styling;
    }
    getStateManagementName(state) {
        const names = {
            pinia: 'Pinia',
            redux: 'Redux Toolkit',
            zustand: 'Zustand',
        };
        return names[state] || state;
    }
    getDatabaseSetupInstructions() {
        switch (this.config.backend.database) {
            case 'postgresql':
                return `Create a PostgreSQL database and update DATABASE_URL in .env:
\`\`\`
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
\`\`\``;
            case 'mysql':
                return `Create a MySQL database and update DATABASE_URL in .env:
\`\`\`
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
\`\`\``;
            case 'mongodb':
                return `Start MongoDB and update DATABASE_URL in .env:
\`\`\`
DATABASE_URL="mongodb://localhost:27017/dbname"
\`\`\``;
            case 'sqlite':
                return `SQLite will create the database file automatically:
\`\`\`
DATABASE_URL="file:./dev.db"
\`\`\``;
            default:
                return '';
        }
    }
}
exports.ReadmeGenerator = ReadmeGenerator;
//# sourceMappingURL=readme.js.map