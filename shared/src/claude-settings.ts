import fs from 'fs';
import path from 'path';
import os from 'os';
import type { ClaudeHook, ClaudeHooksConfig, ClaudeHookMatcher } from './types.js';

const CLAUDE_SETTINGS_PATH_ENV = 'CLAUDE_CODE_SETTINGS_PATH';

/**
 * Get the path to Claude Code settings.json
 */
export function getClaudeSettingsPath(): string {
  const overridePath = process.env[CLAUDE_SETTINGS_PATH_ENV];
  if (overridePath && overridePath.trim()) {
    return overridePath.trim();
  }
  return path.join(os.homedir(), '.claude', 'settings.json');
}

/**
 * Read Claude Code settings.json
 * Returns empty object if file doesn't exist or is invalid
 */
export function readClaudeSettings(): Record<string, unknown> {
  const settingsPath = getClaudeSettingsPath();

  if (!fs.existsSync(settingsPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('  ⚠ Warning: Could not parse settings.json, treating as empty');
    return {};
  }
}

/**
 * Write Claude Code settings.json
 * Ensures directory exists before writing
 */
export function writeClaudeSettings(settings: Record<string, unknown>): void {
  const settingsPath = getClaudeSettingsPath();
  const settingsDir = path.dirname(settingsPath);

  // Ensure .claude directory exists
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

/**
 * Normalize any hook-like object into a valid ClaudeHook.
 * Claude Code settings schema expects `type: "command"`.
 */
function normalizeHook(hook: unknown): ClaudeHook | null {
  if (!hook || typeof hook !== 'object') return null;
  const command = (hook as any).command;
  if (typeof command !== 'string' || !command.trim()) return null;
  return { type: 'command', command };
}

function normalizeHooks(hooks: unknown): ClaudeHook[] {
  if (!Array.isArray(hooks)) return [];
  const normalized: ClaudeHook[] = [];
  for (const h of hooks) {
    const nh = normalizeHook(h);
    if (nh) normalized.push(nh);
  }
  return normalized;
}

/**
 * Build a stable key for hook uniqueness comparison.
 * We consider `command` as identity and always normalize `type` to "command".
 */
function getHookKey(hook: ClaudeHook): string {
  return hook.command;
}

/**
 * Merge hooks from `incoming` into `existing` without duplicates.
 */
function mergeHooks(
  existing: ClaudeHook[],
  incoming: ClaudeHook[]
): { merged: ClaudeHook[]; didChange: boolean } {
  const merged: ClaudeHook[] = [];
  const seen = new Set<string>();
  let didChange = false;

  // Dedupe existing first (also fixes legacy duplicates)
  for (const hook of existing) {
    const key = getHookKey(hook);
    if (!seen.has(key)) {
      merged.push(hook);
      seen.add(key);
    } else {
      didChange = true;
    }
  }

  for (const hook of incoming) {
    const key = getHookKey(hook);
    if (!seen.has(key)) {
      merged.push(hook);
      seen.add(key);
      didChange = true;
    }
  }

  return { merged, didChange };
}

/**
 * Remove hooks in `toRemove` from `existing` (match by command).
 */
function removeHooks(
  existing: ClaudeHook[],
  toRemove: ClaudeHook[]
): { remaining: ClaudeHook[]; didChange: boolean } {
  const removeKeys = new Set(toRemove.map(getHookKey));
  const remaining = existing.filter((h) => !removeKeys.has(getHookKey(h)));
  return { remaining, didChange: remaining.length !== existing.length };
}

/**
 * Find matcher entry index by `matcher` string.
 */
function findMatcherIndex(existingHooks: ClaudeHookMatcher[], matcher: string): number {
  return existingHooks.findIndex((hook) => hook && hook.matcher === matcher);
}

/**
 * Add Claude Code hooks to settings.json
 * Returns true if settings were modified, false if hooks already exist
 */
export function addClaudeHooks(
  hooksConfig: ClaudeHooksConfig,
  skillName: string
): boolean {
  const settings = readClaudeSettings();
  let modified = false;

  // Initialize hooks object if it doesn't exist
  if (!settings.hooks || typeof settings.hooks !== 'object') {
    settings.hooks = {};
  }

  const hooks = settings.hooks as Record<string, unknown>;

  // Process each hook type (PostToolUse, PreToolUse, etc.)
  for (const [hookType, hookMatchers] of Object.entries(hooksConfig)) {
    if (!hookMatchers || !Array.isArray(hookMatchers)) {
      continue;
    }

    // Initialize hook type array if it doesn't exist
    if (!hooks[hookType] || !Array.isArray(hooks[hookType])) {
      hooks[hookType] = [];
    }

    const existingHooks = hooks[hookType] as ClaudeHookMatcher[];

    // Add/merge each hook matcher
    for (const matcher of hookMatchers) {
      const idx = findMatcherIndex(existingHooks, matcher.matcher);
      if (idx === -1) {
        const normalized = {
          matcher: matcher.matcher,
          hooks: normalizeHooks((matcher as any).hooks),
        };
        if (normalized.hooks.length > 0) {
          existingHooks.push(normalized);
          modified = true;
          console.log(`  ✓ Added ${hookType} hook for ${skillName}`);
        }
      } else {
        const existingMatcher = existingHooks[idx];
        const existingMatcherHooks = normalizeHooks((existingMatcher as any).hooks);
        const incomingHooks = normalizeHooks((matcher as any).hooks);

        const { merged, didChange } = mergeHooks(existingMatcherHooks, incomingHooks);
        // Also mark modified if we had to normalize legacy entries (e.g. type:"shell")
        const normalizedChanged =
          Array.isArray((existingMatcher as any).hooks) &&
          JSON.stringify((existingMatcher as any).hooks) !== JSON.stringify(merged);

        if (didChange || normalizedChanged) {
          existingHooks[idx] = { ...existingMatcher, hooks: merged };
          modified = true;
          console.log(`  ✓ Merged ${hookType} hooks for ${skillName} (matcher: ${matcher.matcher})`);
        } else {
          console.log(`  ℹ ${hookType} hook already exists, skipping`);
        }
      }
    }

    hooks[hookType] = existingHooks;
  }

  if (modified) {
    writeClaudeSettings(settings);
  }

  return modified;
}

/**
 * Remove Claude Code hooks from settings.json
 * Returns true if settings were modified, false if no matching hooks found
 */
export function removeClaudeHooks(
  hooksConfig: ClaudeHooksConfig,
  skillName: string
): boolean {
  const settings = readClaudeSettings();
  let modified = false;

  if (!settings.hooks || typeof settings.hooks !== 'object') {
    return false;
  }

  const hooks = settings.hooks as Record<string, unknown>;

  // Process each hook type
  for (const [hookType, hookMatchers] of Object.entries(hooksConfig)) {
    if (!hookMatchers || !Array.isArray(hookMatchers)) {
      continue;
    }

    if (!hooks[hookType] || !Array.isArray(hooks[hookType])) {
      continue;
    }

    const existingHooks = hooks[hookType] as ClaudeHookMatcher[];

    for (const matcher of hookMatchers) {
      const idx = findMatcherIndex(existingHooks, matcher.matcher);
      if (idx === -1) {
        continue;
      }

      const existingMatcher = existingHooks[idx];
      const existingMatcherHooks = normalizeHooks((existingMatcher as any).hooks);
      const toRemoveHooks = normalizeHooks((matcher as any).hooks);

      const { remaining, didChange } = removeHooks(existingMatcherHooks, toRemoveHooks);
      if (didChange) {
        modified = true;
        if (remaining.length === 0) {
          existingHooks.splice(idx, 1);
          console.log(
            `  ✓ Removed ${hookType} matcher for ${skillName} (matcher: ${matcher.matcher})`
          );
        } else {
          existingHooks[idx] = { ...existingMatcher, hooks: remaining };
          console.log(`  ✓ Removed ${hookType} hooks for ${skillName} (matcher: ${matcher.matcher})`);
        }
      } else {
        // Even if nothing removed, normalize legacy hooks to prevent invalid settings lingering.
        const normalizedChanged =
          Array.isArray((existingMatcher as any).hooks) &&
          JSON.stringify((existingMatcher as any).hooks) !== JSON.stringify(existingMatcherHooks);
        if (normalizedChanged) {
          existingHooks[idx] = { ...existingMatcher, hooks: existingMatcherHooks };
          modified = true;
        }
      }
    }

    hooks[hookType] = existingHooks;
  }

  if (modified) {
    writeClaudeSettings(settings);
  }

  return modified;
}
