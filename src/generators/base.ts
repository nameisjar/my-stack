// ============================================
// Base Generator Class
// ============================================

import type { ProjectConfig, Generator } from '../types/index.js';
import {
  ensureDir,
  writeFile,
  writeJsonFile,
  createDirectories,
  createSpinner,
  success,
} from '../utils/index.js';

export abstract class BaseGenerator implements Generator {
  abstract name: string;
  protected config: ProjectConfig;

  constructor(config: ProjectConfig) {
    this.config = config;
  }

  abstract generate(): Promise<void>;

  /**
   * Create standard folder structure
   */
  protected async createFolderStructure(
    basePath: string,
    folders: string[]
  ): Promise<void> {
    await createDirectories(basePath, folders);
  }

  /**
   * Write a file relative to base path
   */
  protected async writeToFile(
    basePath: string,
    relativePath: string,
    content: string
  ): Promise<void> {
    const fullPath = `${basePath}/${relativePath}`;
    await writeFile(fullPath, content);
  }

  /**
   * Write JSON file relative to base path
   */
  protected async writeToJsonFile(
    basePath: string,
    relativePath: string,
    data: object
  ): Promise<void> {
    const fullPath = `${basePath}/${relativePath}`;
    await writeJsonFile(fullPath, data);
  }

  /**
   * Helper to get backend path
   */
  protected get backendPath(): string {
    return this.config.backendPath;
  }

  /**
   * Helper to get frontend path
   */
  protected get frontendPath(): string {
    return this.config.frontendPath;
  }

  /**
   * Helper to check if TypeScript
   */
  protected get isTypeScript(): boolean {
    return this.config.backend.language === 'typescript';
  }

  /**
   * Get file extension based on language
   */
  protected get ext(): string {
    return this.isTypeScript ? 'ts' : 'js';
  }
}
