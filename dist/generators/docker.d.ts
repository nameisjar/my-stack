import { BaseGenerator } from './base.js';
export declare class DockerGenerator extends BaseGenerator {
    name: string;
    generate(): Promise<void>;
    private generateBackendDockerfile;
    private generateFrontendDockerfile;
    private generateDockerCompose;
    private getDatabaseService;
    private getVolumeConfig;
    private generateDockerComposeDev;
    private generateNginxConfig;
    private generateDockerIgnore;
}
//# sourceMappingURL=docker.d.ts.map