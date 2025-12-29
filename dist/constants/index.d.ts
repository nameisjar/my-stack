import type { BackendFramework, BackendLanguage, Database, ORM, AuthStrategy, FrontendFramework, Styling, StateManagement, PackageManager, MailingProvider, PromptChoice } from '../types/index.js';
export declare const BACKEND_FRAMEWORKS: PromptChoice<BackendFramework>[];
export declare const LANGUAGES: PromptChoice<BackendLanguage>[];
export declare const DATABASES: PromptChoice<Database>[];
export declare const ORMS: PromptChoice<ORM>[];
export declare const AUTH_STRATEGIES: PromptChoice<AuthStrategy>[];
export declare const MAILING_PROVIDERS: PromptChoice<MailingProvider>[];
export declare const FRONTEND_FRAMEWORKS: PromptChoice<FrontendFramework>[];
export declare const STYLING_OPTIONS: PromptChoice<Styling>[];
export declare const STATE_MANAGEMENT_VUE: PromptChoice<StateManagement>[];
export declare const STATE_MANAGEMENT_REACT: PromptChoice<StateManagement>[];
export declare const PACKAGE_MANAGERS: PromptChoice<PackageManager>[];
export declare const DEFAULT_BACKEND_PORT = 3000;
export declare const DEFAULT_FRONTEND_PORT = 5173;
export declare const ORM_DATABASE_COMPATIBILITY: Record<ORM, Database[]>;
export declare function getCompatibleORMs(database: Database): ORM[];
export declare function getStateManagementOptions(frontend: FrontendFramework): PromptChoice<StateManagement>[];
//# sourceMappingURL=index.d.ts.map