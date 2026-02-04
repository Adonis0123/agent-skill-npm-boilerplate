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

// shared/src/install-skill.ts
var import_fs3 = __toESM(require("fs"));
var import_path4 = __toESM(require("path"));
var import_os4 = __toESM(require("os"));
var import_child_process = require("child_process");

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
function copyDir(src, dest) {
  import_fs.default.mkdirSync(dest, { recursive: true });
  const entries = import_fs.default.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = import_path.default.join(src, entry.name);
    const destPath = import_path.default.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      import_fs.default.copyFileSync(srcPath, destPath);
    }
  }
}
function ensureDir(dir) {
  if (!import_fs.default.existsSync(dir)) {
    import_fs.default.mkdirSync(dir, { recursive: true });
  }
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
function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return null;
  }
  const [, frontmatterStr, body] = match;
  const frontmatter = {};
  const lines = frontmatterStr.split("\n");
  for (const line of lines) {
    const match2 = line.match(/^(\w+):\s*(.*)$/);
    if (match2) {
      const [, key, value] = match2;
      frontmatter[key] = value.replace(/^["']|["']$/g, "").trim();
    }
  }
  return { frontmatter, body };
}
function patchSkillMdName(skillMdPath, name) {
  try {
    const content = import_fs.default.readFileSync(skillMdPath, "utf-8");
    const parsed = parseYamlFrontmatter(content);
    if (!parsed) {
      console.warn("  \u26A0 Warning: SKILL.md has no frontmatter, skipping name patch");
      return;
    }
    const { frontmatter, body } = parsed;
    frontmatter.name = name;
    const frontmatterLines = Object.entries(frontmatter).map(
      ([key, value]) => `${key}: ${value}`
    );
    const newContent = `---
${frontmatterLines.join("\n")}
---
${body}`;
    import_fs.default.writeFileSync(skillMdPath, newContent, "utf-8");
    console.log(`  \u2713 Patched SKILL.md name: ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`  \u26A0 Warning: Failed to patch SKILL.md name: ${message}`);
  }
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
function mergeHooks(existing, incoming) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  let didChange = false;
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
function findMatcherIndex(existingHooks, matcher) {
  return existingHooks.findIndex((hook) => hook && hook.matcher === matcher);
}
function addClaudeHooks(hooksConfig, skillName) {
  const settings = readClaudeSettings();
  let modified = false;
  if (!settings.hooks || typeof settings.hooks !== "object") {
    settings.hooks = {};
  }
  const hooks = settings.hooks;
  for (const [hookType, hookMatchers] of Object.entries(hooksConfig)) {
    if (!hookMatchers || !Array.isArray(hookMatchers)) {
      continue;
    }
    if (!hooks[hookType] || !Array.isArray(hooks[hookType])) {
      hooks[hookType] = [];
    }
    const existingHooks = hooks[hookType];
    for (const matcher of hookMatchers) {
      const idx = findMatcherIndex(existingHooks, matcher.matcher);
      if (idx === -1) {
        const normalized = {
          matcher: matcher.matcher,
          hooks: normalizeHooks(matcher.hooks)
        };
        if (normalized.hooks.length > 0) {
          existingHooks.push(normalized);
          modified = true;
          console.log(`  \u2713 Added ${hookType} hook for ${skillName}`);
        }
      } else {
        const existingMatcher = existingHooks[idx];
        const existingMatcherHooks = normalizeHooks(existingMatcher.hooks);
        const incomingHooks = normalizeHooks(matcher.hooks);
        const { merged, didChange } = mergeHooks(existingMatcherHooks, incomingHooks);
        const normalizedChanged = Array.isArray(existingMatcher.hooks) && JSON.stringify(existingMatcher.hooks) !== JSON.stringify(merged);
        if (didChange || normalizedChanged) {
          existingHooks[idx] = { ...existingMatcher, hooks: merged };
          modified = true;
          console.log(`  \u2713 Merged ${hookType} hooks for ${skillName} (matcher: ${matcher.matcher})`);
        } else {
          console.log(`  \u2139 ${hookType} hook already exists, skipping`);
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

// shared/src/remote-update-checker-script.ts
var import_path3 = __toESM(require("path"));
var import_os3 = __toESM(require("os"));
var REMOTE_UPDATE_CHECKER_VERSION = "2";
function getRemoteUpdateCheckerScriptContents() {
  const version = REMOTE_UPDATE_CHECKER_VERSION;
  return `#!/usr/bin/env node
/* remote-skill-update-checker v${version} */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const DEFAULT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    force: args.has('--force') || args.has('-f'),
    verbose: args.has('--verbose') || args.has('-v'),
  };
}

/**
 * Get GitHub token from environment for authenticated requests.
 * Authenticated requests have higher rate limits (5000 req/hour vs 60 req/hour).
 */
function getGithubToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const txt = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function writeJson(filePath, obj) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

function getManifestPaths() {
  const cwd = process.cwd();
  return Array.from(
    new Set([
      path.join(os.homedir(), '.claude', 'skills', '.skills-manifest.json'),
      path.join(cwd, '.claude', 'skills', '.skills-manifest.json'),
    ])
  );
}

function getRemoteSourcesFromManifest(manifest) {
  const skills = manifest && typeof manifest.skills === 'object' ? manifest.skills : {};
  const sources = [];
  for (const v of Object.values(skills || {})) {
    if (!v || typeof v !== 'object') continue;
    const s = v.source;
    if (typeof s === 'string' && s.trim()) sources.push(s.trim());
  }
  return Array.from(new Set(sources));
}

function parseRemoteSource(remoteSource) {
  const trimmed = String(remoteSource || '')
    .trim()
    .replace(/^https?:\\/\\/github\\.com\\//, '');
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const repo = parts[1];
  const repoPath = parts.slice(2).join('/') || null;
  return { owner, repo, repoPath };
}

function buildCommitsUrl(remoteSource) {
  const parsed = parseRemoteSource(remoteSource);
  if (!parsed) return null;
  const base =
    'https://api.github.com/repos/' +
    encodeURIComponent(parsed.owner) +
    '/' +
    encodeURIComponent(parsed.repo) +
    '/commits?per_page=1';
  if (!parsed.repoPath) return base;
  return base + '&path=' + encodeURIComponent(parsed.repoPath);
}

function shouldSkipByCooldown(lastCheckedAtIso, now, cooldownMs) {
  if (!lastCheckedAtIso) return false;
  const last = new Date(lastCheckedAtIso);
  if (Number.isNaN(last.getTime())) return false;
  return now.getTime() - last.getTime() < cooldownMs;
}

/**
 * Fetch text from URL with timeout and optional GitHub token.
 * @param {string} url - URL to fetch
 * @param {object} options - Options
 * @param {number} [options.timeout=10000] - Timeout in milliseconds
 * @param {string} [options.githubToken] - GitHub token for authenticated requests
 * @returns {Promise<string>} Response text
 */
function fetchText(url, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  const githubToken = options.githubToken || getGithubToken();

  return new Promise((resolve, reject) => {
    const headers = {
      'user-agent': 'claude-skills-remote-update-checker',
      accept: 'application/vnd.github+json',
    };

    // Add GitHub token if available (increases rate limit from 60 to 5000 req/hour)
    if (githubToken) {
      headers.authorization = 'Bearer ' + githubToken;
    }

    const req = https.request(
      url,
      {
        method: 'GET',
        headers: headers,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          clearTimeout(timeoutId);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error('HTTP ' + (res.statusCode || 0)));
          }
        });
      }
    );

    // Timeout handler
    const timeoutId = setTimeout(() => {
      req.destroy();
      reject(new Error('Request timeout after ' + timeout + 'ms'));
    }, timeout);

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    req.end();
  });
}

function extractLatestSha(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && typeof data[0].sha === 'string') {
      return data[0].sha || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const { force, verbose } = parseArgs(process.argv);
  const now = new Date();
  const cooldownMs = DEFAULT_COOLDOWN_MS;
  const githubToken = getGithubToken();

  const manifestPaths = getManifestPaths();
  const updates = [];

  for (const manifestPath of manifestPaths) {
    const manifest = readJson(manifestPath) || {};
    const sources = getRemoteSourcesFromManifest(manifest);
    if (!sources.length) continue;

    manifest.remoteCache = manifest.remoteCache && typeof manifest.remoteCache === 'object' ? manifest.remoteCache : {};

    for (const remoteSource of sources) {
      const prevEntry = manifest.remoteCache[remoteSource] || {};
      const prevSha = prevEntry.lastSeenSha || null;

      const url = buildCommitsUrl(remoteSource);
      if (!url) continue;

      if (!force && shouldSkipByCooldown(prevEntry.lastCheckedAt, now, cooldownMs)) {
        continue;
      }

      try {
        const text = await fetchText(url, {
          timeout: DEFAULT_TIMEOUT_MS,
          githubToken: githubToken,
        });
        const latestSha = extractLatestSha(text);

        manifest.remoteCache[remoteSource] = {
          ...prevEntry,
          lastCheckedAt: now.toISOString(),
          ...(latestSha ? { lastSeenSha: latestSha } : {}),
        };
        writeJson(manifestPath, manifest);

        // Baseline: first time seeing sha => do not notify
        if (!prevSha && latestSha) continue;

        if (prevSha && latestSha && prevSha !== latestSha) {
          updates.push({ remoteSource, prevSha, latestSha });
        }
      } catch (e) {
        manifest.remoteCache[remoteSource] = {
          ...prevEntry,
          lastCheckedAt: now.toISOString(),
        };
        writeJson(manifestPath, manifest);
        if (verbose) {
          console.log('[remote-skill-check] error', remoteSource, String(e && e.message ? e.message : e));
        }
      }
    }
  }

  if (updates.length > 0) {
    console.log('\\n\u{1F4E1} \u68C0\u6D4B\u5230\u8FDC\u7A0B skill \u6709\u66F4\u65B0\uFF1A');
    for (const u of updates) {
      console.log('  -', u.remoteSource);
      console.log('    ', (u.prevSha || '').slice(0, 7), '->', (u.latestSha || '').slice(0, 7));
    }
    console.log('\\n\u{1F4A1} \u5EFA\u8BAE\u91CD\u65B0\u5B89\u88C5\u5BF9\u5E94 skill \u4EE5\u62C9\u53D6\u6700\u65B0\u7248\u672C\uFF08remoteSource \u6A21\u5F0F\u4E0D\u4F1A\u81EA\u52A8\u66F4\u65B0\uFF09\u3002\\n');
    process.exitCode = 0;
  }
}

main().catch(() => {
  // ignore
});
`;
}
function getRemoteUpdateCheckerScriptInstallPath() {
  const scriptsDir = import_path3.default.join(import_os3.default.homedir(), ".claude", "scripts");
  return import_path3.default.join(scriptsDir, "remote-skill-update-check.js");
}

// shared/src/install-skill.ts
function ensureRemoteUpdateCheckerInstalled() {
  const scriptPath = getRemoteUpdateCheckerScriptInstallPath();
  const scriptsDir = import_path4.default.dirname(scriptPath);
  ensureDir(scriptsDir);
  const marker = `/* remote-skill-update-checker v${REMOTE_UPDATE_CHECKER_VERSION} */`;
  if (import_fs3.default.existsSync(scriptPath)) {
    try {
      const existing = import_fs3.default.readFileSync(scriptPath, "utf-8");
      if (existing.includes(marker)) {
        return scriptPath;
      }
    } catch {
    }
  }
  const contents = getRemoteUpdateCheckerScriptContents();
  import_fs3.default.writeFileSync(scriptPath, contents, { encoding: "utf-8" });
  try {
    import_fs3.default.chmodSync(scriptPath, 493);
  } catch {
  }
  return scriptPath;
}
function ensureRemoteUpdateSessionEndHook(scriptPath) {
  const command = `node "${scriptPath}"`;
  addClaudeHooks(
    {
      SessionEnd: [
        {
          matcher: "*",
          hooks: [
            {
              command,
              // Claude Code settings schema expects "command"
              type: "command"
            }
          ]
        }
      ]
    },
    "remote-update-checker"
  );
}
function fetchFromRemote(tempDir, remoteSource) {
  try {
    console.log(`  \u{1F310} Fetching latest from ${remoteSource}...`);
    (0, import_child_process.execSync)(`npx degit ${remoteSource} "${tempDir}" --force`, {
      stdio: "pipe",
      timeout: 6e4
    });
    if (import_fs3.default.existsSync(import_path4.default.join(tempDir, "SKILL.md"))) {
      console.log("  \u2713 Fetched latest version from remote");
      return true;
    }
    console.warn("  \u26A0 Remote fetch succeeded but SKILL.md not found");
    return false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`  \u26A0 Could not fetch from remote: ${message}`);
    console.log("  \u2139 Using bundled version as fallback");
    return false;
  }
}
function getSourceDir(config, packageDir) {
  if (!config.remoteSource) {
    return {
      sourceDir: packageDir,
      cleanup: () => {
      },
      isRemote: false
    };
  }
  const tempDir = import_path4.default.join(import_os4.default.tmpdir(), `skill-fetch-${Date.now()}`);
  const remoteSuccess = fetchFromRemote(tempDir, config.remoteSource);
  if (remoteSuccess) {
    return {
      sourceDir: tempDir,
      cleanup: () => {
        try {
          import_fs3.default.rmSync(tempDir, { recursive: true, force: true });
        } catch {
        }
      },
      isRemote: true
    };
  }
  try {
    import_fs3.default.rmSync(tempDir, { recursive: true, force: true });
  } catch {
  }
  return {
    sourceDir: packageDir,
    cleanup: () => {
    },
    isRemote: false
  };
}
function updateManifest(skillsDir, config, targetName, isRemote) {
  const manifestPath = import_path4.default.join(skillsDir, ".skills-manifest.json");
  let manifest = { skills: {} };
  if (import_fs3.default.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(import_fs3.default.readFileSync(manifestPath, "utf-8"));
    } catch {
      console.warn("  Warning: Could not parse existing manifest, creating new one");
      manifest = { skills: {} };
    }
  }
  const skillName = extractSkillName(config.name);
  manifest.skills[config.name] = {
    version: config.version,
    installedAt: (/* @__PURE__ */ new Date()).toISOString(),
    package: config.package || config.name,
    path: import_path4.default.join(skillsDir, skillName),
    target: targetName,
    ...config.remoteSource && { source: config.remoteSource }
  };
  import_fs3.default.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
function installToTarget(target, config, sourceDir, isRemote) {
  var _a, _b;
  console.log(`
\u{1F4E6} Installing to ${target.name}...`);
  const isGlobal = isGlobalInstall();
  const location = detectInstallLocation(target.paths, isGlobal);
  const skillName = extractSkillName(config.name);
  const targetDir = import_path4.default.join(location.base, skillName);
  const altTargetDir = import_path4.default.join(location.base, config.name);
  console.log(`  Type: ${location.type}${isGlobal ? " (global)" : " (project)"}`);
  console.log(`  Directory: ${targetDir}`);
  if (import_fs3.default.existsSync(altTargetDir) && altTargetDir !== targetDir) {
    console.log("  \u{1F9F9} Cleaning up alternative path format...");
    removeDir(altTargetDir);
    console.log(`  \u2713 Removed directory: ${config.name}`);
  }
  ensureDir(targetDir);
  const skillMdSource = import_path4.default.join(sourceDir, "SKILL.md");
  if (!import_fs3.default.existsSync(skillMdSource)) {
    throw new Error("SKILL.md is required but not found");
  }
  import_fs3.default.copyFileSync(skillMdSource, import_path4.default.join(targetDir, "SKILL.md"));
  console.log("  \u2713 Copied SKILL.md");
  if (isRemote && config.remoteSource) {
    patchSkillMdName(import_path4.default.join(targetDir, "SKILL.md"), config.name);
  }
  const filesToCopy = config.files || {};
  for (const [source, dest] of Object.entries(filesToCopy)) {
    if (source === "SKILL.md") {
      continue;
    }
    const sourcePath = import_path4.default.join(sourceDir, source);
    if (!import_fs3.default.existsSync(sourcePath)) {
      console.warn(`  \u26A0 Warning: ${source} not found, skipping`);
      continue;
    }
    const destPath = import_path4.default.join(targetDir, dest);
    if (import_fs3.default.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
      console.log(`  \u2713 Copied directory: ${source}`);
    } else {
      const destDir = import_path4.default.dirname(destPath);
      ensureDir(destDir);
      import_fs3.default.copyFileSync(sourcePath, destPath);
      console.log(`  \u2713 Copied file: ${source}`);
    }
  }
  updateManifest(location.base, config, target.name, isRemote);
  if (target.name === "claude-code" && config.remoteSource) {
    try {
      const checkerPath = ensureRemoteUpdateCheckerInstalled();
      ensureRemoteUpdateSessionEndHook(checkerPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  \u26A0 \u8B66\u544A: \u65E0\u6CD5\u914D\u7F6E\u8FDC\u7A0B\u66F4\u65B0\u68C0\u67E5\uFF08\u53EF\u5B89\u5168\u5FFD\u7565\uFF09: ${message}`);
    }
  }
  if (target.name === "claude-code" && ((_a = config.claudeSettings) == null ? void 0 : _a.hooks)) {
    console.log("  \u{1F527} \u914D\u7F6E Claude Code \u94A9\u5B50...");
    try {
      const skillName2 = extractSkillName(config.name);
      const modified = addClaudeHooks(config.claudeSettings.hooks, skillName2);
      if (modified) {
        console.log("  \u2705 \u94A9\u5B50\u5DF2\u914D\u7F6E\u5230 ~/.claude/settings.json");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  \u26A0 \u8B66\u544A: \u65E0\u6CD5\u914D\u7F6E\u94A9\u5B50: ${message}`);
    }
  }
  if ((_b = config.hooks) == null ? void 0 : _b.postinstall) {
    console.log("  \u{1F527} Running postinstall hook...");
    try {
      (0, import_child_process.execSync)(config.hooks.postinstall, {
        cwd: targetDir,
        stdio: "pipe"
      });
      console.log("  \u2713 Postinstall hook completed");
    } catch {
      console.warn("  \u26A0 Warning: postinstall hook failed");
    }
  }
  console.log(`  \u2705 Installed to ${target.name}`);
  return targetDir;
}
function installSkill() {
  console.log("\u{1F680} Installing AI Coding Skill...\n");
  const packageDir = __dirname;
  const config = readSkillConfig(packageDir);
  const enabledTargets = getEnabledTargets(config);
  if (enabledTargets.length === 0) {
    console.warn("\u26A0 No targets enabled in configuration");
    console.warn("Please enable at least one target in .claude-skill.json");
    return;
  }
  console.log(`Installing skill "${config.name}" to ${enabledTargets.length} target(s):`);
  enabledTargets.forEach((target) => {
    console.log(`  \u2022 ${target.name}`);
  });
  const { sourceDir, cleanup, isRemote } = getSourceDir(config, packageDir);
  if (isRemote) {
    console.log(`
\u{1F4E1} Source: Remote (${config.remoteSource})`);
  } else {
    console.log("\n\u{1F4E6} Source: Bundled (local)");
  }
  try {
    const installedPaths = [];
    for (const target of enabledTargets) {
      try {
        const installPath = installToTarget(target, config, sourceDir, isRemote);
        installedPaths.push({ target: target.name, path: installPath });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`
\u274C Failed to install to ${target.name}:`, message);
      }
    }
    console.log("\n" + "=".repeat(60));
    console.log("\u2705 Installation Complete!");
    console.log("=".repeat(60));
    if (installedPaths.length > 0) {
      console.log("\nInstalled to:");
      installedPaths.forEach(({ target, path: installPath }) => {
        console.log(`  \u2022 ${target}: ${installPath}`);
      });
      console.log("\n\u{1F4D6} Next Steps:");
      console.log("  1. Restart your AI coding tool(s)");
      console.log('  2. Ask: "What skills are available?"');
      console.log("  3. Start using your skill!");
    }
  } finally {
    cleanup();
  }
}
try {
  installSkill();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\n\u274C Failed to install skill:", message);
  console.error("\nTroubleshooting:");
  console.error("- Ensure .claude-skill.json exists and is valid JSON");
  console.error("- Ensure SKILL.md exists");
  console.error("- Check file permissions for target directories");
  console.error("- Verify at least one target is enabled in .claude-skill.json");
  console.error("- Try running with sudo for global installation (if needed)");
  process.exit(1);
}
