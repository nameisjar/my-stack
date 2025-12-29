// ============================================
// Next.js Frontend Generator
// ============================================

import path from 'path';
import { BaseGenerator } from '../base.js';
import { writeFile, writeJsonFile } from '../../utils/index.js';

export class NextJSGenerator extends BaseGenerator {
  name = 'Next.js';

  async generate(): Promise<void> {
    await this.createFolderStructure(this.frontendPath, [
      'src/app',
      'src/app/about',
      'src/components',
      'src/hooks',
      'src/lib',
      'src/services',
      'src/store',
      'src/types',
      'public',
    ]);

    await Promise.all([
      this.generatePackageJson(),
      this.generateNextConfig(),
      this.generateTsConfig(),
      this.generateNextEnvDts(),
      this.generateLayout(),
      this.generatePages(),
      this.generateComponents(),
      this.generateServices(),
      this.generateStore(),
      this.generateStyles(),
      this.generateEnvExample(),
      this.generateEslintConfig(),
      this.generateHooks(),
      this.generateFavicon(),
    ]);
  }

  private async generatePackageJson(): Promise<void> {
    const dependencies: Record<string, string> = {
      next: '^14.1.4',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      axios: '^1.6.8',
    };

    const devDependencies: Record<string, string> = {
      '@types/node': '^20.11.30',
      '@types/react': '^18.2.67',
      '@types/react-dom': '^18.2.22',
      typescript: '^5.4.3',
      eslint: '^8.57.0',
      'eslint-config-next': '^14.1.4',
      prettier: '^3.2.5',
    };

    // State management
    if (this.config.frontend.stateManagement === 'redux') {
      dependencies['@reduxjs/toolkit'] = '^2.2.2';
      dependencies['react-redux'] = '^9.1.0';
    } else if (this.config.frontend.stateManagement === 'zustand') {
      dependencies['zustand'] = '^4.5.2';
    }

    // Styling
    if (this.config.frontend.styling === 'tailwind') {
      devDependencies['tailwindcss'] = '^3.4.1';
      devDependencies['postcss'] = '^8.4.38';
      devDependencies['autoprefixer'] = '^10.4.19';
    } else if (this.config.frontend.styling === 'scss') {
      devDependencies['sass'] = '^1.72.0';
    }

    const pkg = {
      name: `${this.config.projectName}-frontend`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: `next dev -p ${this.config.frontend.port}`,
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        format: 'prettier --write "src/**/*.{ts,tsx,css}"',
      },
      dependencies,
      devDependencies,
    };

    await writeJsonFile(path.join(this.frontendPath, 'package.json'), pkg);
  }

  private async generateNextConfig(): Promise<void> {
    const content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:${this.config.backend.port}/api/:path*',
      },
    ];
  },
};

export default nextConfig;
`;

    await writeFile(path.join(this.frontendPath, 'next.config.mjs'), content);

    if (this.config.frontend.styling === 'tailwind') {
      await this.generateTailwindConfig();
    }
  }

  private async generateTailwindConfig(): Promise<void> {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

    await writeFile(path.join(this.frontendPath, 'tailwind.config.js'), tailwindConfig);

    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

    await writeFile(path.join(this.frontendPath, 'postcss.config.js'), postcssConfig);
  }

  private async generateTsConfig(): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };

    await writeJsonFile(path.join(this.frontendPath, 'tsconfig.json'), tsConfig);
  }

  private async generateLayout(): Promise<void> {
    const hasRedux = this.config.frontend.stateManagement === 'redux';
    const hasTailwind = this.config.frontend.styling === 'tailwind';

    // Root layout
    const layout = `import type { Metadata } from 'next';
${hasTailwind ? "import './globals.css';" : ''}
${hasRedux ? "import { Providers } from './providers';" : ''}

export const metadata: Metadata = {
  title: '${this.config.projectName}',
  description: '${this.config.description}',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body${hasTailwind ? ' className="antialiased"' : ''}>
        ${hasRedux ? '<Providers>{children}</Providers>' : '{children}'}
      </body>
    </html>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'app', 'layout.tsx'), layout);

    // Providers (for Redux)
    if (hasRedux) {
      const providers = `'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
`;

      await writeFile(path.join(this.frontendPath, 'src', 'app', 'providers.tsx'), providers);
    }
  }

  private async generatePages(): Promise<void> {
    const hasTailwind = this.config.frontend.styling === 'tailwind';

    // Home page
    const homePage = `'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState<{ status: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await apiService.healthCheck();
        setHealthStatus(data);
      } catch (error) {
        console.error('Failed to check health:', error);
      } finally {
        setLoading(false);
      }
    };
    checkHealth();
  }, []);

  return (
    <main className="${hasTailwind ? 'min-h-screen bg-gray-100 flex items-center justify-center' : 'main'}">
      <div className="${hasTailwind ? 'max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center' : 'container'}">
        <h1 className="${hasTailwind ? 'text-3xl font-bold text-gray-800 mb-4' : ''}">
          🚀 ${this.config.projectName}
        </h1>
        <p className="${hasTailwind ? 'text-gray-600 mb-6' : ''}">
          Your fullstack app is ready!
        </p>
        
        <div className="${hasTailwind ? 'mb-6' : 'status'}">
          <span className="${hasTailwind ? 'text-sm text-gray-500' : ''}">API Status: </span>
          {loading ? (
            <span className="${hasTailwind ? 'text-yellow-500' : 'checking'}">Checking...</span>
          ) : healthStatus?.status === 'ok' ? (
            <span className="${hasTailwind ? 'text-green-500 font-semibold' : 'connected'}">✓ Connected</span>
          ) : (
            <span className="${hasTailwind ? 'text-red-500' : 'disconnected'}">✗ Disconnected</span>
          )}
        </div>

        <Link
          href="/about"
          className="${hasTailwind ? 'inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition' : 'btn'}"
        >
          About
        </Link>
      </div>
    </main>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'app', 'page.tsx'), homePage);

    // About page
    const aboutPage = `import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="${hasTailwind ? 'min-h-screen bg-gray-100 flex items-center justify-center' : 'main'}">
      <div className="${hasTailwind ? 'max-w-md w-full bg-white rounded-lg shadow-lg p-8' : 'container'}">
        <h1 className="${hasTailwind ? 'text-2xl font-bold text-gray-800 mb-4' : ''}">About</h1>
        <p className="${hasTailwind ? 'text-gray-600 mb-4' : ''}">
          This project was generated with <strong>create-my-stack</strong>.
        </p>
        <ul className="${hasTailwind ? 'text-sm text-gray-500 mb-6 space-y-1' : 'stack-list'}">
          <li>🔧 Backend: ${this.config.backend.framework}</li>
          <li>🎨 Frontend: Next.js</li>
          <li>💾 Database: ${this.config.backend.database}</li>
          <li>🔐 Auth: ${this.config.backend.auth}</li>
        </ul>
        <Link href="/" className="${hasTailwind ? 'text-blue-500 hover:underline' : 'link'}">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'app', 'about', 'page.tsx'), aboutPage);

    // Not found page
    const notFoundPage = `import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="${hasTailwind ? 'min-h-screen flex items-center justify-center bg-gray-100' : 'not-found'}">
      <div className="${hasTailwind ? 'text-center' : 'container'}">
        <h1 className="${hasTailwind ? 'text-6xl font-bold text-gray-300 mb-4' : ''}">404</h1>
        <p className="${hasTailwind ? 'text-xl text-gray-600 mb-6' : ''}">Page not found</p>
        <Link href="/" className="${hasTailwind ? 'text-blue-500 hover:underline' : 'link'}">
          Go Home
        </Link>
      </div>
    </main>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'app', 'not-found.tsx'), notFoundPage);
  }

  private async generateComponents(): Promise<void> {
    const content = `import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'components', 'Card.tsx'), content);
    await writeFile(
      path.join(this.frontendPath, 'src', 'components', 'index.ts'),
      "export * from './Card';\n"
    );
  }

  private async generateServices(): Promise<void> {
    const content = `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // TODO: Implement proper auth handling - redirect to login page when available
      console.warn('Unauthorized request - token removed. Implement login page for proper auth flow.');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  async healthCheck() {
    const { data } = await api.get('/health');
    return data;
  },

  async getUsers() {
    const { data } = await api.get('/users');
    return data;
  },

  async createUser(userData: { name: string; email: string }) {
    const { data } = await api.post('/users', userData);
    return data;
  },
};

export default api;
`;

    await writeFile(path.join(this.frontendPath, 'src', 'services', 'api.ts'), content);
  }

  private async generateStore(): Promise<void> {
    const stateManagement = this.config.frontend.stateManagement;

    if (stateManagement === 'redux') {
      // Redux store (same as React)
      const storeContent = `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'index.ts'), storeContent);

      const counterSlice = `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'counterSlice.ts'), counterSlice);

      const userSlice = `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'userSlice.ts'), userSlice);

      const hooks = `import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'hooks.ts'), hooks);
    } else if (stateManagement === 'zustand') {
      const storeContent = `import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, isAuthenticated: false });
  },
}));
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'index.ts'), storeContent);
    } else {
      // No state management - create placeholder file
      const placeholderContent = `// State management is not configured for this project.
// If you need state management later, consider:
// - Redux Toolkit: npm install @reduxjs/toolkit react-redux
// - Zustand: npm install zustand
// - Jotai: npm install jotai

export {};
`;
      await writeFile(path.join(this.frontendPath, 'src', 'store', 'index.ts'), placeholderContent);
    }
  }

  private async generateStyles(): Promise<void> {
    const hasTailwind = this.config.frontend.styling === 'tailwind';

    const content = hasTailwind
      ? `@tailwind base;
@tailwind components;
@tailwind utilities;
`
      : `/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: #3b82f6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.main,
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
}

.btn:hover {
  background: #2563eb;
  text-decoration: none;
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'app', 'globals.css'), content);
  }

  private async generateEnvExample(): Promise<void> {
    const content = `NEXT_PUBLIC_API_URL=http://localhost:${this.config.backend.port}/api
NEXT_PUBLIC_APP_TITLE=${this.config.projectName}
`;

    await writeFile(path.join(this.frontendPath, '.env.example'), content);
    await writeFile(path.join(this.frontendPath, '.env.local.example'), content);
  }

  private async generateEslintConfig(): Promise<void> {
    const config = {
      extends: ['next/core-web-vitals'],
      rules: {},
    };

    await writeJsonFile(path.join(this.frontendPath, '.eslintrc.json'), config);
    await writeJsonFile(path.join(this.frontendPath, '.prettierrc'), {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
    });
  }

  private async generateNextEnvDts(): Promise<void> {
    const content = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

    await writeFile(path.join(this.frontendPath, 'next-env.d.ts'), content);
  }

  private async generateHooks(): Promise<void> {
    // useDebounce hook
    const useDebounce = `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'hooks', 'useDebounce.ts'), useDebounce);

    // useLocalStorage hook
    const useLocalStorage = `'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'hooks', 'useLocalStorage.ts'), useLocalStorage);

    // Index export
    const index = `export * from './useDebounce';
export * from './useLocalStorage';
`;

    await writeFile(path.join(this.frontendPath, 'src', 'hooks', 'index.ts'), index);
  }

  private async generateFavicon(): Promise<void> {
    // Simple SVG favicon
    const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#0070f3"/>
  <text x="50" y="68" font-family="system-ui, sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">N</text>
</svg>
`;

    await writeFile(path.join(this.frontendPath, 'public', 'favicon.svg'), favicon);

    // Also create icon.svg for Next.js app router
    await writeFile(path.join(this.frontendPath, 'src', 'app', 'icon.svg'), favicon);
  }
}
