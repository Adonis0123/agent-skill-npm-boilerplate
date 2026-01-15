import fs from 'fs';
import path from 'path';
import os from 'os';
import type { SkillConfig, EnabledTarget, InstallLocation } from './types.js';

/** Current working directory from npm */
const CWD = process.env.INIT_CWD || process.cwd();

/** Default target configuration for Claude Code */
const DEFAULT_TARGET: EnabledTarget = {
  name: 'claude-code',
  paths: {
    global: '.claude/skills',
    project: '.claude/skills',
  },
};

/**
 * Get enabled target configurations from skill config
 */
export function getEnabledTargets(config: SkillConfig): EnabledTarget[] {
  if (!config.targets) {
    return [DEFAULT_TARGET];
  }

  return Object.entries(config.targets)
    .filter(([_, target]) => target.enabled)
    .map(([name, target]) => ({
      name,
      paths: target.paths,
    }));
}

/**
 * Extract skill name from package name (remove scope prefix)
 * @example "@adonis0123/weekly-report" -> "weekly-report"
 */
export function extractSkillName(packageName: string): string {
  if (packageName.startsWith('@')) {
    return packageName.split('/')[1] || packageName;
  }
  return packageName;
}

/**
 * Detect installation location based on npm install context
 */
export function detectInstallLocation(
  targetPaths: EnabledTarget['paths'],
  isGlobal: boolean
): InstallLocation {
  if (isGlobal) {
    return {
      type: 'personal',
      base: path.join(os.homedir(), targetPaths.global),
    };
  }

  // Project-level installation: find the actual project root
  let projectRoot = CWD;

  while (projectRoot !== path.dirname(projectRoot)) {
    const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
    const hasGit = fs.existsSync(path.join(projectRoot, '.git'));
    const isInNodeModules =
      projectRoot.includes('/node_modules/') ||
      path.basename(projectRoot) === 'node_modules';

    if ((hasPackageJson || hasGit) && !isInNodeModules) {
      break;
    }

    projectRoot = path.dirname(projectRoot);
  }

  // Verify the final path is reasonable
  const finalIsInNodeModules =
    projectRoot.includes('/node_modules/') ||
    path.basename(projectRoot) === 'node_modules';

  if (finalIsInNodeModules) {
    console.warn('⚠ Warning: Could not find project root directory, using current directory');
    projectRoot = CWD;
  }

  return {
    type: 'project',
    base: path.join(projectRoot, targetPaths.project),
  };
}

/**
 * Check if this is a global npm installation
 */
export function isGlobalInstall(): boolean {
  return process.env.npm_config_global === 'true';
}

/**
 * Copy directory recursively
 */
export function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Ensure directory exists
 */
export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Remove directory recursively
 */
export function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Read and parse .claude-skill.json from a directory
 */
export function readSkillConfig(dir: string): SkillConfig {
  const configPath = path.join(dir, '.claude-skill.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('.claude-skill.json not found');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
