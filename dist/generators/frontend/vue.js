"use strict";
// ============================================
// Vue 3 Frontend Generator
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueGenerator = void 0;
const path_1 = __importDefault(require("path"));
const base_js_1 = require("../base.js");
const index_js_1 = require("../../utils/index.js");
class VueGenerator extends base_js_1.BaseGenerator {
    name = 'Vue 3';
    async generate() {
        await this.createFolderStructure(this.frontendPath, [
            'src/assets',
            'src/components',
            'src/composables',
            'src/layouts',
            'src/pages',
            'src/router',
            'src/services',
            'src/stores',
            'src/types',
            'public',
        ]);
        await Promise.all([
            this.generatePackageJson(),
            this.generateViteConfig(),
            this.generateTsConfig(),
            this.generateIndexHtml(),
            this.generateMainEntry(),
            this.generateAppVue(),
            this.generateRouter(),
            this.generatePages(),
            this.generateComponents(),
            this.generateServices(),
            this.generateStores(),
            this.generateStyles(),
            this.generateEnvExample(),
            this.generateEslintConfig(),
            this.generateComposables(),
            this.generateFavicon(),
        ]);
    }
    async generatePackageJson() {
        const dependencies = {
            vue: '^3.4.21',
            'vue-router': '^4.3.0',
            axios: '^1.6.8',
        };
        const devDependencies = {
            '@vitejs/plugin-vue': '^5.0.4',
            vite: '^5.2.6',
            typescript: '^5.4.3',
            'vue-tsc': '^2.0.7',
            '@types/node': '^20.11.30',
            eslint: '^8.57.0',
            'eslint-plugin-vue': '^9.24.0',
            prettier: '^3.2.5',
            '@vue/eslint-config-typescript': '^13.0.0',
            '@vue/eslint-config-prettier': '^9.0.0',
        };
        // State management
        if (this.config.frontend.stateManagement === 'pinia') {
            dependencies['pinia'] = '^2.1.7';
        }
        // Styling
        if (this.config.frontend.styling === 'tailwind') {
            devDependencies['tailwindcss'] = '^3.4.1';
            devDependencies['postcss'] = '^8.4.38';
            devDependencies['autoprefixer'] = '^10.4.19';
        }
        else if (this.config.frontend.styling === 'scss') {
            devDependencies['sass'] = '^1.72.0';
        }
        const pkg = {
            name: `${this.config.projectName}-frontend`,
            version: '1.0.0',
            private: true,
            type: 'module',
            scripts: {
                dev: `vite --port ${this.config.frontend.port}`,
                build: 'vue-tsc && vite build',
                preview: 'vite preview',
                lint: 'eslint src --ext .vue,.ts,.js --fix',
                format: 'prettier --write "src/**/*.{vue,ts,js,css}"',
            },
            dependencies,
            devDependencies,
        };
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.frontendPath, 'package.json'), pkg);
    }
    async generateViteConfig() {
        const hasTailwind = this.config.frontend.styling === 'tailwind';
        const content = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'vite.config.ts'), content);
        // Tailwind config
        if (hasTailwind) {
            await this.generateTailwindConfig();
        }
    }
    async generateTailwindConfig() {
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'tailwind.config.js'), tailwindConfig);
        const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'postcss.config.js'), postcssConfig);
    }
    async generateTsConfig() {
        const tsConfig = {
            compilerOptions: {
                target: 'ES2020',
                useDefineForClassFields: true,
                module: 'ESNext',
                lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                skipLibCheck: true,
                moduleResolution: 'bundler',
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: 'preserve',
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
                baseUrl: '.',
                paths: {
                    '@/*': ['src/*'],
                },
            },
            include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
            references: [{ path: './tsconfig.node.json' }],
        };
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.frontendPath, 'tsconfig.json'), tsConfig);
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
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.frontendPath, 'tsconfig.node.json'), tsConfigNode);
    }
    async generateIndexHtml() {
        const content = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${this.config.projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'index.html'), content);
    }
    async generateMainEntry() {
        const hasPinia = this.config.frontend.stateManagement === 'pinia';
        const content = `import { createApp } from 'vue';
${hasPinia ? "import { createPinia } from 'pinia';" : ''}
import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);

${hasPinia ? 'app.use(createPinia());' : ''}
app.use(router);

app.mount('#app');
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'main.ts'), content);
    }
    async generateAppVue() {
        const content = `<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style scoped>
/* App-level styles */
</style>
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'App.vue'), content);
    }
    async generateRouter() {
        const content = `import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'router', 'index.ts'), content);
    }
    async generatePages() {
        const hasTailwind = this.config.frontend.styling === 'tailwind';
        // Home Page
        const homePage = hasTailwind
            ? `<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/api';

const healthStatus = ref<{ status: string } | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    healthStatus.value = await apiService.healthCheck();
  } catch (error) {
    console.error('Failed to check health:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        🚀 ${this.config.projectName}
      </h1>
      <p class="text-gray-600 mb-6">
        Your fullstack app is ready!
      </p>
      
      <div class="mb-6">
        <span class="text-sm text-gray-500">API Status: </span>
        <span v-if="loading" class="text-yellow-500">Checking...</span>
        <span v-else-if="healthStatus?.status === 'ok'" class="text-green-500 font-semibold">
          ✓ Connected
        </span>
        <span v-else class="text-red-500">✗ Disconnected</span>
      </div>

      <div class="space-x-4">
        <router-link
          to="/about"
          class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          About
        </router-link>
      </div>
    </div>
  </div>
</template>
`
            : `<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/api';

const healthStatus = ref<{ status: string } | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    healthStatus.value = await apiService.healthCheck();
  } catch (error) {
    console.error('Failed to check health:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home-page">
    <div class="container">
      <h1>🚀 ${this.config.projectName}</h1>
      <p>Your fullstack app is ready!</p>
      
      <div class="status">
        <span>API Status: </span>
        <span v-if="loading" class="checking">Checking...</span>
        <span v-else-if="healthStatus?.status === 'ok'" class="connected">✓ Connected</span>
        <span v-else class="disconnected">✗ Disconnected</span>
      </div>

      <router-link to="/about" class="btn">About</router-link>
    </div>
  </div>
</template>

<style scoped>
.home-page {
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

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.status {
  margin: 1.5rem 0;
}

.checking { color: orange; }
.connected { color: green; font-weight: bold; }
.disconnected { color: red; }

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.btn:hover {
  background: #2563eb;
}
</style>
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'pages', 'HomePage.vue'), homePage);
        // About Page
        const aboutPage = hasTailwind
            ? `<script setup lang="ts">
// About page
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">About</h1>
      <p class="text-gray-600 mb-4">
        This project was generated with <strong>create-my-stack</strong>.
      </p>
      <ul class="text-sm text-gray-500 mb-6 space-y-1">
        <li>🔧 Backend: ${this.config.backend.framework}</li>
        <li>🎨 Frontend: Vue 3</li>
        <li>💾 Database: ${this.config.backend.database}</li>
        <li>🔐 Auth: ${this.config.backend.auth}</li>
      </ul>
      <router-link to="/" class="text-blue-500 hover:underline">
        ← Back to Home
      </router-link>
    </div>
  </div>
</template>
`
            : `<template>
  <div class="about-page">
    <div class="container">
      <h1>About</h1>
      <p>This project was generated with <strong>create-my-stack</strong>.</p>
      <ul>
        <li>🔧 Backend: ${this.config.backend.framework}</li>
        <li>🎨 Frontend: Vue 3</li>
        <li>💾 Database: ${this.config.backend.database}</li>
        <li>🔐 Auth: ${this.config.backend.auth}</li>
      </ul>
      <router-link to="/">← Back to Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.container {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

li {
  margin: 0.5rem 0;
}
</style>
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'pages', 'AboutPage.vue'), aboutPage);
        // 404 Page
        const notFoundPage = `<template>
  <div class="${hasTailwind ? 'min-h-screen flex items-center justify-center bg-gray-100' : 'not-found'}">
    <div class="${hasTailwind ? 'text-center' : 'container'}">
      <h1 class="${hasTailwind ? 'text-6xl font-bold text-gray-300 mb-4' : ''}">404</h1>
      <p class="${hasTailwind ? 'text-xl text-gray-600 mb-6' : ''}">Page not found</p>
      <router-link to="/" class="${hasTailwind ? 'text-blue-500 hover:underline' : 'link'}">
        Go Home
      </router-link>
    </div>
  </div>
</template>
${!hasTailwind ? `
<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
}

h1 {
  font-size: 5rem;
  color: #ccc;
}
</style>
` : ''}`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'pages', 'NotFoundPage.vue'), notFoundPage);
    }
    async generateComponents() {
        // Example component
        const content = `<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
}

h3 {
  margin: 0 0 0.5rem 0;
}
</style>
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'components', 'BaseCard.vue'), content);
    }
    async generateServices() {
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
  // Health check
  async healthCheck() {
    const { data } = await api.get('/health');
    return data;
  },

  // Example: Get users
  async getUsers() {
    const { data } = await api.get('/users');
    return data;
  },

  // Example: Create user
  async createUser(userData: { name: string; email: string }) {
    const { data } = await api.post('/users', userData);
    return data;
  },
};

export default api;
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'services', 'api.ts'), content);
    }
    async generateStores() {
        if (this.config.frontend.stateManagement === 'pinia') {
            const content = `import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  return { count, doubleCount, increment, decrement };
});

// Example user store
export const useUserStore = defineStore('user', () => {
  const user = ref<{ id: string; name: string; email: string } | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  function setUser(userData: typeof user.value) {
    user.value = userData;
  }

  function logout() {
    user.value = null;
    localStorage.removeItem('token');
  }

  return { user, isAuthenticated, setUser, logout };
});
`;
            await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'stores', 'index.ts'), content);
        }
        else {
            // No state management (Pinia not selected) - create placeholder file  
            const placeholderContent = `// State management is not configured for this project.
// If you need state management later, consider:
// - Pinia: npm install pinia (recommended for Vue 3)
// - Vuex: npm install vuex@next

export {};
`;
            await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'stores', 'index.ts'), placeholderContent);
        }
    }
    async generateStyles() {
        const hasTailwind = this.config.frontend.styling === 'tailwind';
        const content = hasTailwind
            ? `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
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
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'assets', 'main.css'), content);
    }
    async generateEnvExample() {
        const content = `VITE_API_URL=http://localhost:${this.config.backend.port}/api
VITE_APP_TITLE=${this.config.projectName}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, '.env.example'), content);
    }
    async generateEslintConfig() {
        const config = {
            root: true,
            extends: [
                'plugin:vue/vue3-recommended',
                'eslint:recommended',
                '@vue/eslint-config-typescript',
                '@vue/eslint-config-prettier/skip-formatting',
            ],
            parserOptions: {
                ecmaVersion: 'latest',
            },
            rules: {
                'vue/multi-word-component-names': 'off',
            },
        };
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.frontendPath, '.eslintrc.json'), config);
        await (0, index_js_1.writeJsonFile)(path_1.default.join(this.frontendPath, '.prettierrc'), {
            semi: true,
            singleQuote: true,
            tabWidth: 2,
        });
    }
    async generateComposables() {
        // useDebounce composable
        const useDebounce = `import { ref, watch, type Ref } from 'vue';

export function useDebounce<T>(value: Ref<T>, delay: number = 500): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout>;

  watch(value, (newValue) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'composables', 'useDebounce.ts'), useDebounce);
        // useLocalStorage composable
        const useLocalStorage = `import { ref, watch, type Ref } from 'vue';

export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  const storedValue = ref(initialValue) as Ref<T>;

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        storedValue.value = JSON.parse(item);
      }
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
    }
  }

  // Watch for changes and sync to localStorage
  watch(storedValue, (newValue) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(\`Error setting localStorage key "\${key}":\`, error);
      }
    }
  }, { deep: true });

  return storedValue;
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'composables', 'useLocalStorage.ts'), useLocalStorage);
        // useFetch composable
        const useFetch = `import { ref, type Ref } from 'vue';
import { apiService } from '@/services/api';

interface UseFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  execute: () => Promise<void>;
}

export function useFetch<T>(fetcher: () => Promise<T>): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const execute = async () => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fetcher();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      loading.value = false;
    }
  };

  return { data, error, loading, execute };
}
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'composables', 'useFetch.ts'), useFetch);
        // Index export
        const index = `export * from './useDebounce';
export * from './useLocalStorage';
export * from './useFetch';
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'src', 'composables', 'index.ts'), index);
    }
    async generateFavicon() {
        // Simple SVG favicon for Vite/Vue
        const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,5 95,95 5,95" fill="#42b883"/>
  <polygon points="50,20 80,85 20,85" fill="#35495e"/>
</svg>
`;
        await (0, index_js_1.writeFile)(path_1.default.join(this.frontendPath, 'public', 'vite.svg'), favicon);
    }
}
exports.VueGenerator = VueGenerator;
//# sourceMappingURL=vue.js.map