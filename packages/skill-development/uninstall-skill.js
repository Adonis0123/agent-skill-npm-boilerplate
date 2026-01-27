#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// shared/src/uninstall-skill.ts
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));

// shared/src/utils.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_os = __toESM(require("os"));
var CWD = process.env.INIT_CWD || process.cwd();
var DEFAULT_TARGET = {
  name: "claude-code",
  paths: {
    global: ".claude/skills",
    project: ".claude/skills"
  }
};
function getEnabledTargets(config) {
  if (!config.targets) {
    return [DEFAULT_TARGET];
  }
  return Object.entries(config.targets).filter(([_, target]) => target.enabled).map(([name, target]) => ({
    name,
    paths: target.paths
  }));
}
function extractSkillName(packageName) {
  if (packageName.startsWith("@")) {
    return packageName.split("/")[1] || packageName;
  }
  return packageName;
}
function detectInstallLocation(targetPaths, isGlobal) {
  if (isGlobal) {
    return {
      type: "personal",
      base: import_path.default.join(import_os.default.homedir(), targetPaths.global)
    };
  }
  let projectRoot = CWD;
  while (projectRoot !== import_path.default.dirname(projectRoot)) {
    const hasPackageJson = import_fs.default.existsSync(import_path.default.join(projectRoot, "package.json"));
    const hasGit = import_fs.default.existsSync(import_path.default.join(projectRoot, ".git"));
    const isInNodeModules = projectRoot.includes("/node_modules/") || import_path.default.basename(projectRoot) === "node_modules";
    if ((hasPackageJson || hasGit) && !isInNodeModules) {
      break;
    }
    projectRoot = import_path.default.dirname(projectRoot);
  }
  const finalIsInNodeModules = projectRoot.includes("/node_modules/") || import_path.default.basename(projectRoot) === "node_modules";
  if (finalIsInNodeModules) {
    console.warn("\u26A0 Warning: Could not find project root directory, using current directory");
    projectRoot = CWD;
  }
  return {
    type: "project",
    base: import_path.default.join(projectRoot, targetPaths.project)
  };
}
function isGlobalInstall() {
  return process.env.npm_config_global === "true";
}
function removeDir(dir) {
  if (import_fs.default.existsSync(dir)) {
    import_fs.default.rmSync(dir, { recursive: true, force: true });
  }
}
function readSkillConfig(dir) {
  const configPath = import_path.default.join(dir, ".claude-skill.json");
  if (!import_fs.default.existsSync(configPath)) {
    throw new Error(".claude-skill.json not found");
  }
  return JSON.parse(import_fs.default.readFileSync(configPath, "utf-8"));
}

// shared/src/claude-settings.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_os2 = __toESM(require("os"));
var CLAUDE_SETTINGS_PATH_ENV = "CLAUDE_CODE_SETTINGS_PATH";
function getClaudeSettingsPath() {
  const overridePath = process.env[CLAUDE_SETTINGS_PATH_ENV];
  if (overridePath && overridePath.trim()) {
    return overridePath.trim();
  }
  return import_path2.default.join(import_os2.default.homedir(), ".claude", "settings.json");
}
function readClaudeSettings() {
  const settingsPath = getClaudeSettingsPath();
  if (!import_fs2.default.existsSync(settingsPath)) {
    return {};
  }
  try {
    const content = import_fs2.default.readFileSync(settingsPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.warn("  \u26A0 Warning: Could not parse settings.json, treating as empty");
    return {};
  }
}
function writeClaudeSettings(settings) {
  const settingsPath = getClaudeSettingsPath();
  const settingsDir = import_path2.default.dirname(settingsPath);
  if (!import_fs2.default.existsSync(settingsDir)) {
    import_fs2.default.mkdirSync(settingsDir, { recursive: true });
  }
  import_fs2.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
}
function normalizeHook(hook) {
  if (!hook || typeof hook !== "object") return null;
  const command = hook.command;
  if (typeof command !== "string" || !command.trim()) return null;
  return { type: "command", command };
}
function normalizeHooks(hooks) {
  if (!Array.isArray(hooks)) return [];
  const normalized = [];
  for (const h of hooks) {
    const nh = normalizeHook(h);
    if (nh) normalized.push(nh);
  }
  return normalized;
}
function getHookKey(hook) {
  return hook.command;
}
function removeHooks(existing, toRemove) {
  const removeKeys = new Set(toRemove.map(getHookKey));
  const remaining = existing.filter((h) => !removeKeys.has(getHookKey(h)));
  return { remaining, didChange: remaining.length !== existing.length };
}
function findMatcherIndex(existingHooks, matcher) {
  return existingHooks.findIndex((hook) => hook && hook.matcher === matcher);
}
function removeClaudeHooks(hooksConfig, skillName) {
  const settings = readClaudeSettings();
  let modified = false;
  if (!settings.hooks || typeof settings.hooks !== "object") {
    return false;
  }
  const hooks = settings.hooks;
  for (const [hookType, hookMatchers] of Object.entries(hooksConfig)) {
    if (!hookMatchers || !Array.isArray(hookMatchers)) {
      continue;
    }
    if (!hooks[hookType] || !Array.isArray(hooks[hookType])) {
      continue;
    }
    const existingHooks = hooks[hookType];
    for (const matcher of hookMatchers) {
      const idx = findMatcherIndex(existingHooks, matcher.matcher);
      if (idx === -1) {
        continue;
      }
      const existingMatcher = existingHooks[idx];
      const existingMatcherHooks = normalizeHooks(existingMatcher.hooks);
      const toRemoveHooks = normalizeHooks(matcher.hooks);
      const { remaining, didChange } = removeHooks(existingMatcherHooks, toRemoveHooks);
      if (didChange) {
        modified = true;
        if (remaining.length === 0) {
          existingHooks.splice(idx, 1);
          console.log(
            `  \u2713 Removed ${hookType} matcher for ${skillName} (matcher: ${matcher.matcher})`
          );
        } else {
          existingHooks[idx] = { ...existingMatcher, hooks: remaining };
          console.log(`  \u2713 Removed ${hookType} hooks for ${skillName} (matcher: ${matcher.matcher})`);
        }
      } else {
        const normalizedChanged = Array.isArray(existingMatcher.hooks) && JSON.stringify(existingMatcher.hooks) !== JSON.stringify(existingMatcherHooks);
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

// shared/src/uninstall-skill.ts
function updateManifest(skillsDir, config) {
  const manifestPath = import_path3.default.join(skillsDir, ".skills-manifest.json");
  if (!import_fs3.default.existsSync(manifestPath)) {
    return;
  }
  try {
    const manifest = JSON.parse(import_fs3.default.readFileSync(manifestPath, "utf-8"));
    if (manifest.skills && manifest.skills[config.name]) {
      delete manifest.skills[config.name];
      import_fs3.default.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log("  \u2713 Updated manifest");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("  Warning: Could not update manifest:", message);
  }
}
function uninstallFromTarget(target, config) {
  var _a;
  console.log(`
\u{1F5D1}\uFE0F  Uninstalling from ${target.name}...`);
  const isGlobal = isGlobalInstall();
  const location = detectInstallLocation(target.paths, isGlobal);
  const skillName = extractSkillName(config.name);
  const skillNameTargetDir = import_path3.default.join(location.base, skillName);
  const fullPackageNameTargetDir = import_path3.default.join(location.base, config.name);
  let removed = false;
  if (import_fs3.default.existsSync(skillNameTargetDir)) {
    removeDir(skillNameTargetDir);
    console.log(`  \u2713 Removed skill directory: ${skillName}`);
    removed = true;
  }
  if (import_fs3.default.existsSync(fullPackageNameTargetDir) && fullPackageNameTargetDir !== skillNameTargetDir) {
    removeDir(fullPackageNameTargetDir);
    console.log(`  \u2713 Removed skill directory: ${config.name}`);
    removed = true;
  }
  updateManifest(location.base, config);
  if (target.name === "claude-code" && removed && ((_a = config.claudeSettings) == null ? void 0 : _a.hooks)) {
    try {
      console.log("  \u{1F527} \u79FB\u9664 Claude Code \u94A9\u5B50...");
      const skillName2 = extractSkillName(config.name);
      const modified = removeClaudeHooks(config.claudeSettings.hooks, skillName2);
      if (modified) {
        console.log("  \u2705 \u94A9\u5B50\u5DF2\u4ECE ~/.claude/settings.json \u79FB\u9664");
      }
    } catch (error) {
      console.warn("  \u26A0 \u8B66\u544A: \u65E0\u6CD5\u79FB\u9664\u94A9\u5B50\uFF08\u53EF\u5B89\u5168\u5FFD\u7565\uFF09");
    }
  }
  if (removed) {
    console.log(`  \u2705 Uninstalled from ${target.name}`);
    return true;
  } else {
    console.log(`  \u2139\uFE0F  Skill was not installed in ${target.name}`);
    return false;
  }
}
function uninstallSkill() {
  console.log("\u{1F5D1}\uFE0F  Uninstalling AI Coding Skill...\n");
  const packageDir = __dirname;
  let config;
  try {
    config = readSkillConfig(packageDir);
  } catch {
    console.warn("Warning: .claude-skill.json not found, skipping cleanup");
    return;
  }
  const enabledTargets = getEnabledTargets(config);
  console.log(`Uninstalling skill "${config.name}" from ${enabledTargets.length} target(s):`);
  enabledTargets.forEach((target) => {
    console.log(`  \u2022 ${target.name}`);
  });
  const uninstalledFrom = [];
  for (const target of enabledTargets) {
    try {
      const success = uninstallFromTarget(target, config);
      if (success) {
        uninstalledFrom.push(target.name);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`
\u274C Failed to uninstall from ${target.name}:`, message);
    }
  }
  console.log("\n" + "=".repeat(60));
  if (uninstalledFrom.length > 0) {
    console.log("\u2705 Uninstallation Complete!");
    console.log("=".repeat(60));
    console.log("\nUninstalled from:");
    uninstalledFrom.forEach((target) => {
      console.log(`  \u2022 ${target}`);
    });
  } else {
    console.log("\u2139\uFE0F  Skill was not installed");
    console.log("=".repeat(60));
  }
}
try {
  uninstallSkill();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\n\u26A0\uFE0F  Warning during uninstall:", message);
}
