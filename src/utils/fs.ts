// ============================================
// File System Utilities
// ============================================

import fs from 'fs-extra';
import path from 'path';

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Write file with content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Write JSON file
 */
export async function writeJsonFile(filePath: string, data: object): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * Copy file or directory
 */
export async function copyPath(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * Check if path exists
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  return fs.pathExists(targetPath);
}

/**
 * Remove file or directory
 */
export async function removePath(targetPath: string): Promise<void> {
  await fs.remove(targetPath);
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Read JSON file
 */
export async function readJsonFile<T = Record<string, unknown>>(filePath: string): Promise<T> {
  return fs.readJson(filePath);
}

/**
 * Create multiple directories
 */
export async function createDirectories(basePath: string, dirs: string[]): Promise<void> {
  await Promise.all(dirs.map((dir) => ensureDir(path.join(basePath, dir))));
}

/**
 * Write multiple files
 */
export async function writeFiles(
  files: Array<{ path: string; content: string }>
): Promise<void> {
  await Promise.all(files.map((file) => writeFile(file.path, file.content)));
}
