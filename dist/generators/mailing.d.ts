import { BaseGenerator } from './base.js';
export declare class MailingGenerator extends BaseGenerator {
    name: string;
    generate(): Promise<void>;
    private generateMailClient;
    private generateEmailTemplates;
    private generateEmailService;
    private updatePackageJson;
    /**
     * Generate environment variables for mailing
     */
    getEnvVariables(): string;
}
//# sourceMappingURL=mailing.d.ts.map