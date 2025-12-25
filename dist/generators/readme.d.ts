import { BaseGenerator } from './base.js';
export declare class ReadmeGenerator extends BaseGenerator {
    name: string;
    generate(): Promise<void>;
    private generateMainReadme;
    private generateBackendReadme;
    private generateFrontendReadme;
    private getFrameworkName;
    private getFrontendFrameworkName;
    private getDatabaseName;
    private getORMName;
    private getStylingName;
    private getStateManagementName;
    private getDatabaseSetupInstructions;
}
//# sourceMappingURL=readme.d.ts.map