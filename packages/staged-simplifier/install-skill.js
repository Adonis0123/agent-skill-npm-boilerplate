#!/usr/bin/env node
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
var import_path3 = __toESM(require("path"));
var import_os3 = __toESM(require("os"));
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
function setYamlFrontmatter(content, overrides) {
  const parsed = parseYamlFrontmatter(content);
  if (!parsed) {
    return content;
  }
  const frontmatter = { ...parsed.frontmatter, ...overrides };
  const frontmatterLines = Object.entries(frontmatter).map(
    ([key, value]) => `${key}: ${value}`
  );
  return `---
${frontmatterLines.join("\n")}
---
${parsed.body}`;
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
function resolveCodeSimplifierSource(skillsBaseDir) {
  const installedSkillDir = import_path3.default.join(skillsBaseDir, "code-simplifier");
  const installedSkillMdPath = import_path3.default.join(installedSkillDir, "SKILL.md");
  if (import_fs3.default.existsSync(installedSkillMdPath)) {
    return {
      skillMdPath: installedSkillMdPath,
      referencesDir: import_path3.default.join(installedSkillDir, "references"),
      label: "installed-skill"
    };
  }
  try {
    const pkgJsonPath = require.resolve("@adonis0123/code-simplifier/package.json");
    const pkgDir = import_path3.default.dirname(pkgJsonPath);
    const pkgSkillMdPath = import_path3.default.join(pkgDir, "SKILL.md");
    if (import_fs3.default.existsSync(pkgSkillMdPath)) {
      return {
        skillMdPath: pkgSkillMdPath,
        referencesDir: import_path3.default.join(pkgDir, "references"),
        label: "dependency-pkg"
      };
    }
  } catch {
  }
  const monorepoPkgDir = import_path3.default.join(__dirname, "..", "code-simplifier");
  const monorepoSkillMdPath = import_path3.default.join(monorepoPkgDir, "SKILL.md");
  if (import_fs3.default.existsSync(monorepoSkillMdPath)) {
    return {
      skillMdPath: monorepoSkillMdPath,
      referencesDir: import_path3.default.join(monorepoPkgDir, "references"),
      label: "monorepo"
    };
  }
  return null;
}

// shared/src/claude-settings.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_os2 = __toESM(require("os"));
function getClaudeSettingsPath() {
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
function hookMatcherExists(existingHooks, newMatcher) {
  return existingHooks.some((hook) => hook.matcher === newMatcher.matcher);
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
      if (!hookMatcherExists(existingHooks, matcher)) {
        existingHooks.push(matcher);
        modified = true;
        console.log(`  \u2713 Added ${hookType} hook for ${skillName}`);
      } else {
        console.log(`  \u2139 ${hookType} hook already exists, skipping`);
      }
    }
    hooks[hookType] = existingHooks;
  }
  if (modified) {
    writeClaudeSettings(settings);
  }
  return modified;
}

// shared/src/install-skill.ts
function fetchFromRemote(tempDir, remoteSource) {
  try {
    console.log(`  \u{1F310} Fetching latest from ${remoteSource}...`);
    (0, import_child_process.execSync)(`npx degit ${remoteSource} "${tempDir}" --force`, {
      stdio: "pipe",
      timeout: 6e4
    });
    if (import_fs3.default.existsSync(import_path3.default.join(tempDir, "SKILL.md"))) {
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
  const tempDir = import_path3.default.join(import_os3.default.tmpdir(), `skill-fetch-${Date.now()}`);
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
  const manifestPath = import_path3.default.join(skillsDir, ".skills-manifest.json");
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
    path: import_path3.default.join(skillsDir, skillName),
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
  const codeSimplifierSource = resolveCodeSimplifierSource(location.base);
  const skillName = extractSkillName(config.name);
  const targetDir = import_path3.default.join(location.base, skillName);
  const altTargetDir = import_path3.default.join(location.base, config.name);
  console.log(`  Type: ${location.type}${isGlobal ? " (global)" : " (project)"}`);
  console.log(`  Directory: ${targetDir}`);
  if (import_fs3.default.existsSync(altTargetDir) && altTargetDir !== targetDir) {
    console.log("  \u{1F9F9} Cleaning up alternative path format...");
    removeDir(altTargetDir);
    console.log(`  \u2713 Removed directory: ${config.name}`);
  }
  ensureDir(targetDir);
  const stagedSkillMdSource = import_path3.default.join(sourceDir, "SKILL.md");
  if (!import_fs3.default.existsSync(stagedSkillMdSource)) {
    throw new Error("SKILL.md is required but not found");
  }
  const targetSkillMdPath = import_path3.default.join(targetDir, "SKILL.md");
  const stagedFallbackContent = import_fs3.default.readFileSync(stagedSkillMdSource, "utf-8");
  const stagedParsed = parseYamlFrontmatter(stagedFallbackContent);
  const stagedDescription = stagedParsed == null ? void 0 : stagedParsed.frontmatter.description;
  const addonPath = import_path3.default.join(__dirname, "SKILL.addon.md");
  const addonContent = import_fs3.default.existsSync(addonPath) ? import_fs3.default.readFileSync(addonPath, "utf-8").trim() : "";
  if (codeSimplifierSource && import_fs3.default.existsSync(codeSimplifierSource.skillMdPath)) {
    const baseContent = import_fs3.default.readFileSync(codeSimplifierSource.skillMdPath, "utf-8");
    const overrides = {
      name: config.name,
      version: config.version,
      ...stagedDescription ? { description: stagedDescription } : {}
    };
    let mergedContent = setYamlFrontmatter(baseContent, overrides);
    if (addonContent) {
      mergedContent = `${mergedContent}

---

${addonContent}
`;
    }
    import_fs3.default.writeFileSync(targetSkillMdPath, mergedContent, "utf-8");
    console.log(`  \u2713 Generated SKILL.md from code-simplifier (${codeSimplifierSource.label})`);
  } else {
    import_fs3.default.copyFileSync(stagedSkillMdSource, targetSkillMdPath);
    console.log("  \u2713 Copied SKILL.md");
    if (!codeSimplifierSource) {
      console.warn("  \u26A0 Warning: Could not find code-simplifier source, using bundled SKILL.md");
    }
  }
  if (isRemote && config.remoteSource) {
    patchSkillMdName(targetSkillMdPath, config.name);
  }
  const filesToCopy = config.files || {};
  for (const [source, dest] of Object.entries(filesToCopy)) {
    if (source === "SKILL.md") {
      continue;
    }
    const sourcePath = import_path3.default.join(sourceDir, source);
    if (!import_fs3.default.existsSync(sourcePath)) {
      console.warn(`  \u26A0 Warning: ${source} not found, skipping`);
      continue;
    }
    const destPath = import_path3.default.join(targetDir, dest);
    if (import_fs3.default.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
      console.log(`  \u2713 Copied directory: ${source}`);
    } else {
      const destDir = import_path3.default.dirname(destPath);
      ensureDir(destDir);
      import_fs3.default.copyFileSync(sourcePath, destPath);
      console.log(`  \u2713 Copied file: ${source}`);
    }
  }
  const referencesDir = import_path3.default.join(targetDir, "references");
  ensureDir(referencesDir);
  if (codeSimplifierSource && codeSimplifierSource.referencesDir && import_fs3.default.existsSync(codeSimplifierSource.referencesDir)) {
    const destDir = import_path3.default.join(referencesDir, "code-simplifier");
    copyDir(codeSimplifierSource.referencesDir, destDir);
    console.log("  \u2713 Copied directory: code-simplifier references");
  }
  updateManifest(location.base, config, target.name, isRemote);
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
