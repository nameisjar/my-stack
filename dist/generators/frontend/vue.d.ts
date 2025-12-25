import { BaseGenerator } from '../base.js';
export declare class VueGenerator extends BaseGenerator {
    name: string;
    generate(): Promise<void>;
    private generatePackageJson;
    private generateViteConfig;
    private generateTailwindConfig;
    private generateTsConfig;
    private generateIndexHtml;
    private generateMainEntry;
    private generateAppVue;
    private generateRouter;
    private generatePages;
    private generateComponents;
    private generateServices;
    private generateStores;
    private generateStyles;
    private generateEnvExample;
    private generateEslintConfig;
}
//# sourceMappingURL=vue.d.ts.map