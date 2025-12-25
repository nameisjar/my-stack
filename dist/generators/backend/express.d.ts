import { BaseGenerator } from '../base.js';
export declare class ExpressGenerator extends BaseGenerator {
    name: string;
    generate(): Promise<void>;
    private generatePackageJson;
    private generateTsConfig;
    private generateMainEntry;
    private generateApp;
    private generateRoutes;
    private generateControllers;
    private generateMiddlewares;
    private generateConfig;
    private generateEnvExample;
    private generateEslintConfig;
    private generatePrettierConfig;
}
//# sourceMappingURL=express.d.ts.map