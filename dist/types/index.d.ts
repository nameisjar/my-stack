export type BackendFramework = 'express' | 'fastify' | 'nestjs';
export type BackendLanguage = 'javascript' | 'typescript';
export type Database = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'none';
export type ORM = 'prisma' | 'sequelize' | 'mongoose' | 'none';
export type AuthStrategy = 'jwt' | 'session' | 'none';
export type FrontendFramework = 'vue' | 'react' | 'nextjs' | 'none';
export type Styling = 'tailwind' | 'css' | 'scss';
export type StateManagement = 'pinia' | 'redux' | 'zustand' | 'none';
export type ProjectStructure = 'monorepo' | 'separate';
export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export interface ProjectConfig {
    projectName: string;
    description: string;
    backend: {
        framework: BackendFramework;
        language: BackendLanguage;
        database: Database;
        orm: ORM;
        auth: AuthStrategy;
        port: number;
    };
    frontend: {
        framework: FrontendFramework;
        styling: Styling;
        stateManagement: StateManagement;
        port: number;
    };
    structure: ProjectStructure;
    packageManager: PackageManager;
    initGit: boolean;
    docker: boolean;
    rootPath: string;
    backendPath: string;
    frontendPath: string;
}
export interface Generator {
    name: string;
    generate(config: ProjectConfig): Promise<void>;
}
export interface TemplateContext {
    projectName: string;
    description: string;
    backendFramework: BackendFramework;
    frontendFramework: FrontendFramework;
    database: Database;
    orm: ORM;
    auth: AuthStrategy;
    language: BackendLanguage;
    packageManager: PackageManager;
    isMonorepo: boolean;
    hasDocker: boolean;
    backendPort: number;
    frontendPort: number;
}
export interface FileTemplate {
    path: string;
    content: string;
    condition?: (config: ProjectConfig) => boolean;
}
export interface PromptChoice<T = string> {
    name: string;
    value: T;
    description?: string;
}
export interface CLIOptions {
    projectName?: string;
    template?: string;
    yes?: boolean;
    skipInstall?: boolean;
}
//# sourceMappingURL=index.d.ts.map