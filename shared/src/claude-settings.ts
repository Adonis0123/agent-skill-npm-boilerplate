import fs from 'fs';
import path from 'path';
import os from 'os';
import type { ClaudeHooksConfig, ClaudeHookMatcher } from './types.js';

/**
 * Get the path to Claude Code settings.json
 */
export function getClaudeSettingsPath(): string {
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
 * Check if a hook matcher already exists in the array
 */
function hookMatcherExists(
  existingHooks: ClaudeHookMatcher[],
  newMatcher: ClaudeHookMatcher
): boolean {
  return existingHooks.some((hook) => hook.matcher === newMatcher.matcher);
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

    // Add each hook matcher if it doesn't already exist
    for (const matcher of hookMatchers) {
      if (!hookMatcherExists(existingHooks, matcher)) {
        existingHooks.push(matcher);
        modified = true;
        console.log(`  ✓ Added ${hookType} hook for ${skillName}`);
      } else {
        console.log(`  ℹ ${hookType} hook already exists, skipping`);
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
    const initialLength = existingHooks.length;

    // Filter out hooks that match our matchers
    const matchersToRemove = hookMatchers.map((m) => m.matcher);
    const filteredHooks = existingHooks.filter(
      (hook) => !matchersToRemove.includes(hook.matcher)
    );

    if (filteredHooks.length < initialLength) {
      hooks[hookType] = filteredHooks;
      modified = true;
      console.log(`  ✓ Removed ${hookType} hook for ${skillName}`);
    }
  }

  if (modified) {
    writeClaudeSettings(settings);
  }

  return modified;
}
