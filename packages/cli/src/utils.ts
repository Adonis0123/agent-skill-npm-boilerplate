import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import type {
  Platform,
  SourceType,
  InstallScope,
  InstallRecord,
  SkillFrontmatter,
} from './types.js';
import { PLATFORM_CONFIGS } from './types.js';

/**
 * Get the skills directory for a platform
 */
export function getSkillsDir(
  platform: Platform,
  scope: InstallScope
): string {
  const config = PLATFORM_CONFIGS[platform];
  if (scope === 'global') {
    return path.join(os.homedir(), config.globalDir);
  }
  return path.join(process.cwd(), config.projectDir);
}

/**
 * Get the install directory for a specific skill
 */
export function getSkillInstallDir(
  platform: Platform,
  scope: InstallScope,
  skillName: string
): string {
  return path.join(getSkillsDir(platform, scope), skillName);
}

/**
 * Classify the source type
 */
export function classifySource(source: string): SourceType {
  // Check if local path exists
  const resolved = path.resolve(source);
  if (fs.existsSync(resolved)) {
    return 'local';
  }

  // Check if npm package
  if (source.startsWith('@') || source.startsWith('npm:')) {
    return 'npm';
  }

  // Check if GitHub URL
  if (/^https?:\/\//i.test(source) || source.includes('github.com')) {
    return 'github-url';
  }

  // Check if degit shorthand (owner/repo or owner/repo/path)
  if (/^[^/]+\/[^/]+/.test(source)) {
    return 'degit-shorthand';
  }

  throw new Error(`Unsupported source: ${source}`);
}

/**
 * Extract skill name from source
 */
export function extractSkillName(source: string): string {
  // Local path
  const resolved = path.resolve(source);
  if (fs.existsSync(resolved)) {
    return path.basename(resolved) || 'unknown-skill';
  }

  // Clean up query/hash
  const cleaned = source.replace(/[#?].*$/, '');

  // GitHub tree URL: .../tree/branch/path/to/skill
  const treeMatch = cleaned.match(/\/tree\/[^/]+\/(.+?)(?:\/)?$/);
  if (treeMatch) {
    return treeMatch[1].split('/').pop() || 'unknown-skill';
  }

  // GitHub repo URL
  const repoMatch = cleaned.match(/github\.com\/[^/]+\/([^/]+)/);
  if (repoMatch) {
    return repoMatch[1].replace(/\.git$/, '');
  }

  // Degit shorthand: owner/repo/path
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 1] || 'unknown-skill';
  }

  return cleaned || 'unknown-skill';
}

/**
 * Convert GitHub URL to degit path
 */
export function toDegitPath(url: string): string {
  // GitHub tree URL with subpath
  const treeMatch = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+?)(?:\/)?$/
  );
  if (treeMatch) {
    const [, owner, repo, branch, subpath] = treeMatch;
    return `${owner}/${repo}/${subpath}#${branch}`;
  }

  // GitHub tree URL without subpath
  const treeRootMatch = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/)?$/
  );
  if (treeRootMatch) {
    const [, owner, repo, branch] = treeRootMatch;
    return `${owner}/${repo}#${branch}`;
  }

  // GitHub repo URL
  const repoMatch = url.match(/github\.com\/([^/]+\/[^/]+)/);
  if (repoMatch) {
    return repoMatch[1].replace(/\.git$/, '');
  }

  return url;
}

/**
 * Parse SKILL.md frontmatter
 */
export function parseSkillFrontmatter(content: string): SkillFrontmatter {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const frontmatter: SkillFrontmatter = {};
  const lines = frontmatterMatch[1].split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      (frontmatter as any)[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return frontmatter;
}

/**
 * Read SKILL.md from a directory
 */
export function readSkillMd(dir: string): string | null {
  const skillMdPath = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    return null;
  }
  return fs.readFileSync(skillMdPath, 'utf-8');
}

/**
 * Read install record from a skill directory
 */
export function readInstallRecord(dir: string): InstallRecord | null {
  const metaPath = path.join(dir, '.skill-meta.json');
  if (!fs.existsSync(metaPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Write install record to a skill directory
 */
export function writeInstallRecord(dir: string, record: InstallRecord): void {
  const metaPath = path.join(dir, '.skill-meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(record, null, 2));
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
 * Remove directory recursively
 */
export function removeDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Clone from remote using degit
 */
export async function cloneFromRemote(
  source: string,
  targetDir: string
): Promise<void> {
  const degitPath = toDegitPath(source);

  // Use npx degit
  execSync(`npx degit "${degitPath}" "${targetDir}" --force`, {
    stdio: 'pipe',
    timeout: 60000,
  });
}

/**
 * Ensure directory exists
 */
export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
