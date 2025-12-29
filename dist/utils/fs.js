"use strict";
// ============================================
// File System Utilities
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDir = ensureDir;
exports.writeFile = writeFile;
exports.writeJsonFile = writeJsonFile;
exports.copyPath = copyPath;
exports.pathExists = pathExists;
exports.removePath = removePath;
exports.readFile = readFile;
exports.readJsonFile = readJsonFile;
exports.createDirectories = createDirectories;
exports.writeFiles = writeFiles;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/**
 * Ensure directory exists, create if not
 */
async function ensureDir(dirPath) {
    await fs_extra_1.default.ensureDir(dirPath);
}
/**
 * Write file with content
 */
async function writeFile(filePath, content) {
    await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
    await fs_extra_1.default.writeFile(filePath, content, 'utf-8');
}
/**
 * Write JSON file
 */
async function writeJsonFile(filePath, data) {
    await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
    await fs_extra_1.default.writeJson(filePath, data, { spaces: 2 });
}
/**
 * Copy file or directory
 */
async function copyPath(src, dest) {
    await fs_extra_1.default.copy(src, dest);
}
/**
 * Check if path exists
 */
async function pathExists(targetPath) {
    return fs_extra_1.default.pathExists(targetPath);
}
/**
 * Remove file or directory
 */
async function removePath(targetPath) {
    await fs_extra_1.default.remove(targetPath);
}
/**
 * Read file content
 */
async function readFile(filePath) {
    return fs_extra_1.default.readFile(filePath, 'utf-8');
}
/**
 * Read JSON file
 */
async function readJsonFile(filePath) {
    return fs_extra_1.default.readJson(filePath);
}
/**
 * Create multiple directories
 */
async function createDirectories(basePath, dirs) {
    await Promise.all(dirs.map((dir) => ensureDir(path_1.default.join(basePath, dir))));
}
/**
 * Write multiple files
 */
async function writeFiles(files) {
    await Promise.all(files.map((file) => writeFile(file.path, file.content)));
}
//# sourceMappingURL=fs.js.map