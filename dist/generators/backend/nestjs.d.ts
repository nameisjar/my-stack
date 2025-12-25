import { BaseGenerator } from '../base.js';
export declare class NestJSGenerator extends BaseGenerator {
    name: string;
    protected get isTypeScript(): boolean;
    generate(): Promise<void>;
    private generatePackageJson;
    private generateTsConfig;
    private generateNestCliConfig;
    private generateMain;
    private generateAppModule;
    private generateAppController;
    private generateAppService;
    private generateHealthModule;
    private generateConfigModule;
    private generateCommonFiles;
    private generateEnvExample;
    private generateEslintConfig;
    private generatePrettierConfig;
}
//# sourceMappingURL=nestjs.d.ts.map