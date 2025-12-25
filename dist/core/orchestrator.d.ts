import type { ProjectConfig } from '../types/index.js';
export declare class ProjectOrchestrator {
    private config;
    constructor(config: ProjectConfig);
    generate(): Promise<void>;
    private calculateTotalSteps;
    private createProjectStructure;
    private generateRootFiles;
    private generateRootEnvExample;
    private generateMonorepoPackageJson;
    private generateBackend;
    private generateFrontend;
    private initializeGit;
}
//# sourceMappingURL=orchestrator.d.ts.map