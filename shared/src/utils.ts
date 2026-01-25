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

/**
 * Parse YAML frontmatter from markdown content
 * @param content - Markdown content with YAML frontmatter
 * @returns Parsed frontmatter and body, or null if no frontmatter
 */
export function parseYamlFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const [, frontmatterStr, body] = match;
  const frontmatter: Record<string, string> = {};

  // Simple YAML key-value parser (supports "key: value" format)
  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      frontmatter[key] = value.replace(/^["']|["']$/g, '').trim();
    }
  }

  return { frontmatter, body };
}

/**
 * Patch the 'name' field in SKILL.md frontmatter
 * Preserves all other frontmatter fields and content
 * @param skillMdPath - Path to SKILL.md file
 * @param name - New name value from .claude-skill.json
 */
export function patchSkillMdName(skillMdPath: string, name: string): void {
  try {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const parsed = parseYamlFrontmatter(content);

    if (!parsed) {
      // No frontmatter, skip patching
      console.warn('  ⚠ Warning: SKILL.md has no frontmatter, skipping name patch');
      return;
    }

    const { frontmatter, body } = parsed;

    // Update name field
    frontmatter.name = name;

    // Rebuild YAML frontmatter
    const frontmatterLines = Object.entries(frontmatter).map(
      ([key, value]) => `${key}: ${value}`
    );
    const newContent = `---\n${frontmatterLines.join('\n')}\n---\n${body}`;

    // Write back to file
    fs.writeFileSync(skillMdPath, newContent, 'utf-8');
    console.log(`  ✓ Patched SKILL.md name: ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`  ⚠ Warning: Failed to patch SKILL.md name: ${message}`);
    // Don't interrupt installation on patch failure
  }
}
