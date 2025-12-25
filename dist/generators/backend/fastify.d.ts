import { BaseGenerator } from '../base.js';
export declare class FastifyGenerator extends BaseGenerator {
    name: string;
    generate(): Promise<void>;
    private generatePackageJson;
    private generateTsConfig;
    private generateMainEntry;
    private generateApp;
    private generateRoutes;
    private generatePlugins;
    private generateSchemas;
    private generateConfig;
    private generateEnvExample;
    private generateEslintConfig;
    private generatePrettierConfig;
}
//# sourceMappingURL=fastify.d.ts.map