/**
 * Skill configuration type definitions for npm postinstall scripts
 */

/** Target configuration for a specific platform */
export interface TargetConfig {
  enabled: boolean;
  paths: {
    global: string;
    project: string;
  };
}

/** Hooks configuration */
export interface HooksConfig {
  postinstall?: string;
  preuninstall?: string;
}

/**
 * Skill configuration loaded from .claude-skill.json
 */
export interface SkillConfig {
  /** Skill name (e.g., "weekly-report") */
  name: string;
  /** Version string (e.g., "1.0.0") */
  version: string;
  /** Full package name with scope (e.g., "@adonis0123/weekly-report") */
  package: string;
  /** Remote source URL for degit (optional) - if present, use remote mode */
  remoteSource?: string;
  /** Additional files to copy from package to skills directory */
  files?: Record<string, string>;
  /** Target platforms for installation */
  targets?: Record<string, TargetConfig>;
  /** Lifecycle hooks */
  hooks?: HooksConfig;
}

/** Installation location information */
export interface InstallLocation {
  type: 'personal' | 'project';
  base: string;
}

/** An enabled target platform */
export interface EnabledTarget {
  name: string;
  paths: {
    global: string;
    project: string;
  };
}

/** Installation mode determined by configuration */
export type InstallMode = 'local' | 'remote';

/** Installation summary result */
export interface InstallResult {
  target: string;
  path: string;
}

/** Uninstall summary result */
export interface UninstallResult {
  target: string;
  success: boolean;
}
