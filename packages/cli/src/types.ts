/**
 * Supported platforms for skill installation
 */
export const PLATFORMS = ['claude', 'cursor', 'codex', 'copilot'] as const;
export type Platform = (typeof PLATFORMS)[number];

/**
 * Platform configuration
 */
export interface PlatformConfig {
  name: string;
  displayName: string;
  globalDir: string;
  projectDir: string;
}

/**
 * Platform configurations
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  claude: {
    name: 'claude',
    displayName: 'Claude Code',
    globalDir: '.claude/skills',
    projectDir: '.claude/skills',
  },
  cursor: {
    name: 'cursor',
    displayName: 'Cursor',
    globalDir: '.cursor/skills',
    projectDir: '.cursor/skills',
  },
  codex: {
    name: 'codex',
    displayName: 'Codex',
    globalDir: '.codex/skills',
    projectDir: '.codex/skills',
  },
  copilot: {
    name: 'copilot',
    displayName: 'GitHub Copilot',
    globalDir: '.copilot/skills',
    projectDir: '.copilot/skills',
  },
};

/**
 * Source types for skill installation
 */
export type SourceType = 'local' | 'github-url' | 'degit-shorthand' | 'npm';

/**
 * Installation scope
 */
export type InstallScope = 'global' | 'local';

/**
 * Skill metadata from SKILL.md frontmatter
 */
export interface SkillFrontmatter {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  dependencies?: string[];
}

/**
 * Install record stored in .skill-meta.json
 */
export interface InstallRecord {
  name: string;
  source: string;
  sourceType: SourceType;
  platform: Platform;
  scope: InstallScope;
  installedAt: string;
  updatedAt?: string;
  installDir: string;
  frontmatter?: SkillFrontmatter;
}

/**
 * CLI options for install command
 */
export interface InstallOptions {
  target?: Platform;
  local?: boolean;
  force?: boolean;
  all?: boolean;
}

/**
 * CLI options for list command
 */
export interface ListOptions {
  target?: Platform;
  local?: boolean;
  paths?: boolean;
  json?: boolean;
}

/**
 * CLI options for update command
 */
export interface UpdateOptions {
  target?: Platform;
  local?: boolean;
}

/**
 * CLI options for uninstall command
 */
export interface UninstallOptions {
  target?: Platform;
  local?: boolean;
  force?: boolean;
}
