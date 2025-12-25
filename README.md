# create-my-stack

🚀 CLI Generator untuk Fullstack Boilerplate yang reusable dan production-ready.

## ✨ Features

- **Interactive CLI** - Pilih stack dengan mudah melalui prompts interaktif
- **Multiple Backend Options** - Express.js, Fastify, NestJS
- **Multiple Frontend Options** - Vue 3, React, Next.js
- **Database Support** - PostgreSQL, MySQL, MongoDB, SQLite
- **ORM Integration** - Prisma, Sequelize, Mongoose
- **Authentication** - JWT, Session-based
- **Styling Options** - Tailwind CSS, Plain CSS, SCSS
- **State Management** - Pinia, Redux Toolkit, Zustand
- **Docker Ready** - Dockerfile, docker-compose, nginx config
- **Clean Architecture** - Struktur folder yang rapi dan scalable

## 📦 Installation

```bash
# Using npx (recommended)
npx create-my-stack

# Or install globally
npm install -g create-my-stack
create-my-stack
```

## 🚀 Quick Start

```bash
# Run the CLI
npx create-my-stack

# Follow the prompts to select your stack:
# - Backend framework
# - Language (TypeScript/JavaScript)
# - Database
# - ORM
# - Authentication
# - Frontend framework
# - Styling
# - State management
# - Project structure (monorepo/separate)
# - Package manager
```

## 📁 Generated Structure

### Monorepo

```
my-project/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Separate Repos

```
my-project/
├── backend/
│   ├── src/
│   ├── .git
│   └── package.json
└── frontend/
    ├── src/
    ├── .git
    └── package.json
```

## 🛠️ Commands

```bash
# Interactive mode
npx create-my-stack

# Skip confirmation
npx create-my-stack --yes

# Use predefined template
npx create-my-stack template express-vue

# List available options
npx create-my-stack list
```

## 📚 Available Templates

| Template | Stack |
|----------|-------|
| `express-vue` | Express + Vue 3 + Tailwind + Prisma |
| `express-react` | Express + React + Tailwind + Prisma |
| `nestjs-nextjs` | NestJS + Next.js + Tailwind + Prisma |
| `fastify-vue` | Fastify + Vue 3 + Tailwind + Prisma |

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/your-repo/create-my-stack
cd create-my-stack

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Test locally
node dist/index.js
```

## 📄 License

MIT

---

Made with ❤️ by developers, for developers.
