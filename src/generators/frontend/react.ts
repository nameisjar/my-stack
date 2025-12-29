// ============================================
// React Frontend Generator
// ============================================

import path from 'path';
import { BaseGenerator } from '../base.js';
import { writeFile, writeJsonFile } from '../../utils/index.js';

export class ReactGenerator extends BaseGenerator {
  name = 'React';

  async generate(): Promise<void> {
    await this.createFolderStructure(this.frontendPath, [
      'src/assets',
      'src/components',
      'src/hooks',
      'src/layouts',
      'src/pages',
      'src/services',
      'src/store',
      'src/types',
      'src/utils',
      'public',
    ]);

    await Promise.all([
      this.generatePackageJson(),
      this.generateViteConfig(),
      this.generateTsConfig(),
      this.generateIndexHtml(),
      this.generateMainEntry(),
      this.generateApp(),
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
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.22.3',
      axios: '^1.6.8',
    };

    const devDependencies: Record<string, string> = {
      '@types/react': '^18.2.67',
      '@types/react-dom': '^18.2.22',
      '@vitejs/plugin-react': '^4.2.1',
      vite: '^5.2.6',
      typescript: '^5.4.3',
      '@typescript-eslint/eslint-plugin': '^7.4.0',
      '@typescript-eslint/parser': '^7.4.0',
      eslint: '^8.57.0',
      'eslint-plugin-react': '^7.34.1',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-react-refresh': '^0.4.6',
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
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: `vite --port ${this.config.frontend.port}`,
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
        format: 'prettier --write "src/**/*.{ts,tsx,css}"',
      },
      dependencies,
      devDependencies,
    };

    await writeJsonFile(path.join(this.frontendPath, 'package.json'), pkg);
  }

  private async generateViteConfig(): Promise<void> {
    const content = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: ${this.config.frontend.port},
    proxy: {
      '/api': {
        target: 'http://localhost:${this.config.backend.port}',
        changeOrigin: true,
      },
    },
  },
});
`;

    await writeFile(path.join(this.frontendPath, 'vite.config.ts'), content);

    if (this.config.frontend.styling === 'tailwind') {
      await this.generateTailwindConfig();
    }
  }

  private async generateTailwindConfig(): Promise<void> {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

    await writeFile(path.join(this.frontendPath, 'tailwind.config.js'), tailwindConfig);

    const postcssConfig = `export default {
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
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
        },
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    };

    await writeJsonFile(path.join(this.frontendPath, 'tsconfig.json'), tsConfig);

    const tsConfigNode = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        strict: true,
      },
      include: ['vite.config.ts'],
    };

    await writeJsonFile(path.join(this.frontendPath, 'tsconfig.node.json'), tsConfigNode);
  }

  private async generateIndexHtml(): Promise<void> {
    const content = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

    await writeFile(path.join(this.frontendPath, 'index.html'), content);
  }

  private async generateMainEntry(): Promise<void> {
    const hasRedux = this.config.frontend.stateManagement === 'redux';

    const content = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
${hasRedux ? "import { Provider } from 'react-redux';\nimport { store } from './store';" : ''}
import App from './App';
import './assets/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    ${hasRedux ? '<Provider store={store}>' : ''}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    ${hasRedux ? '</Provider>' : ''}
  </React.StrictMode>
);
`;

    await writeFile(path.join(this.frontendPath, 'src', 'main.tsx'), content);
  }

  private async generateApp(): Promise<void> {
    const content = `import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
`;

    await writeFile(path.join(this.frontendPath, 'src', 'App.tsx'), content);
  }

  private async generatePages(): Promise<void> {
    const hasTailwind = this.config.frontend.styling === 'tailwind';

    // Home Page
    const homePage = `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="${hasTailwind ? 'min-h-screen bg-gray-100 flex items-center justify-center' : 'home-page'}">
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
          to="/about"
          className="${hasTailwind ? 'inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition' : 'btn'}"
        >
          About
        </Link>
      </div>
    </div>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'pages', 'HomePage.tsx'), homePage);

    // About Page
    const aboutPage = `import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="${hasTailwind ? 'min-h-screen bg-gray-100 flex items-center justify-center' : 'about-page'}">
      <div className="${hasTailwind ? 'max-w-md w-full bg-white rounded-lg shadow-lg p-8' : 'container'}">
        <h1 className="${hasTailwind ? 'text-2xl font-bold text-gray-800 mb-4' : ''}">About</h1>
        <p className="${hasTailwind ? 'text-gray-600 mb-4' : ''}">
          This project was generated with <strong>create-my-stack</strong>.
        </p>
        <ul className="${hasTailwind ? 'text-sm text-gray-500 mb-6 space-y-1' : 'stack-list'}">
          <li>🔧 Backend: ${this.config.backend.framework}</li>
          <li>🎨 Frontend: React</li>
          <li>💾 Database: ${this.config.backend.database}</li>
          <li>🔐 Auth: ${this.config.backend.auth}</li>
        </ul>
        <Link to="/" className="${hasTailwind ? 'text-blue-500 hover:underline' : 'link'}">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'pages', 'AboutPage.tsx'), aboutPage);

    // 404 Page
    const notFoundPage = `import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="${hasTailwind ? 'min-h-screen flex items-center justify-center bg-gray-100' : 'not-found'}">
      <div className="${hasTailwind ? 'text-center' : 'container'}">
        <h1 className="${hasTailwind ? 'text-6xl font-bold text-gray-300 mb-4' : ''}">404</h1>
        <p className="${hasTailwind ? 'text-xl text-gray-600 mb-6' : ''}">Page not found</p>
        <Link to="/" className="${hasTailwind ? 'text-blue-500 hover:underline' : 'link'}">
          Go Home
        </Link>
      </div>
    </div>
  );
}
`;

    await writeFile(path.join(this.frontendPath, 'src', 'pages', 'NotFoundPage.tsx'), notFoundPage);
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

    // Index export
    await writeFile(
      path.join(this.frontendPath, 'src', 'components', 'index.ts'),
      "export * from './Card';\n"
    );
  }

  private async generateServices(): Promise<void> {
    const content = `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
      // Redux store
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

      // Counter slice
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

      // User slice
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
      localStorage.removeItem('token');
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'userSlice.ts'), userSlice);

      // Hooks
      const hooks = `import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;

      await writeFile(path.join(this.frontendPath, 'src', 'store', 'hooks.ts'), hooks);
    } else if (stateManagement === 'zustand') {
      // Zustand store
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
    localStorage.removeItem('token');
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

.home-page,
.about-page,
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

.status {
  margin: 1.5rem 0;
}

.checking { color: orange; }
.connected { color: green; font-weight: bold; }
.disconnected { color: red; }
`;

    await writeFile(path.join(this.frontendPath, 'src', 'assets', 'index.css'), content);
  }

  private async generateEnvExample(): Promise<void> {
    const content = `VITE_API_URL=http://localhost:${this.config.backend.port}/api
VITE_APP_TITLE=${this.config.projectName}
`;

    await writeFile(path.join(this.frontendPath, '.env.example'), content);
  }

  private async generateEslintConfig(): Promise<void> {
    const config = {
      root: true,
      env: { browser: true, es2020: true },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
      ],
      ignorePatterns: ['dist', '.eslintrc.cjs'],
      parser: '@typescript-eslint/parser',
      plugins: ['react-refresh'],
      rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      },
    };

    await writeJsonFile(path.join(this.frontendPath, '.eslintrc.json'), config);
    await writeJsonFile(path.join(this.frontendPath, '.prettierrc'), {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
    });
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
    const useLocalStorage = `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
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
    // Simple SVG favicon for Vite/React
    const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#61dafb"/>
  <circle cx="50" cy="50" r="8" fill="#20232a"/>
  <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="#20232a" stroke-width="3"/>
  <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="#20232a" stroke-width="3" transform="rotate(60 50 50)"/>
  <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="#20232a" stroke-width="3" transform="rotate(-60 50 50)"/>
</svg>
`;

    await writeFile(path.join(this.frontendPath, 'public', 'vite.svg'), favicon);
  }
}
