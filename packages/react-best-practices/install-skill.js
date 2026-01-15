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
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_os2 = __toESM(require("os"));
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

// shared/src/install-skill.ts
function fetchFromRemote(tempDir, remoteSource) {
  try {
    console.log(`  \u{1F310} Fetching latest from ${remoteSource}...`);
    (0, import_child_process.execSync)(`npx degit ${remoteSource} "${tempDir}" --force`, {
      stdio: "pipe",
      timeout: 6e4
    });
    if (import_fs2.default.existsSync(import_path2.default.join(tempDir, "SKILL.md"))) {
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
  const tempDir = import_path2.default.join(import_os2.default.tmpdir(), `skill-fetch-${Date.now()}`);
  const remoteSuccess = fetchFromRemote(tempDir, config.remoteSource);
  if (remoteSuccess) {
    return {
      sourceDir: tempDir,
      cleanup: () => {
        try {
          import_fs2.default.rmSync(tempDir, { recursive: true, force: true });
        } catch {
        }
      },
      isRemote: true
    };
  }
  try {
    import_fs2.default.rmSync(tempDir, { recursive: true, force: true });
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
  const manifestPath = import_path2.default.join(skillsDir, ".skills-manifest.json");
  let manifest = { skills: {} };
  if (import_fs2.default.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(import_fs2.default.readFileSync(manifestPath, "utf-8"));
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
    path: import_path2.default.join(skillsDir, skillName),
    target: targetName,
    ...config.remoteSource && { source: config.remoteSource }
  };
  import_fs2.default.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
function installToTarget(target, config, sourceDir, isRemote) {
  var _a;
  console.log(`
\u{1F4E6} Installing to ${target.name}...`);
  const isGlobal = isGlobalInstall();
  const location = detectInstallLocation(target.paths, isGlobal);
  const skillName = extractSkillName(config.name);
  const targetDir = import_path2.default.join(location.base, skillName);
  const altTargetDir = import_path2.default.join(location.base, config.name);
  console.log(`  Type: ${location.type}${isGlobal ? " (global)" : " (project)"}`);
  console.log(`  Directory: ${targetDir}`);
  if (import_fs2.default.existsSync(altTargetDir) && altTargetDir !== targetDir) {
    console.log("  \u{1F9F9} Cleaning up alternative path format...");
    removeDir(altTargetDir);
    console.log(`  \u2713 Removed directory: ${config.name}`);
  }
  ensureDir(targetDir);
  const skillMdSource = import_path2.default.join(sourceDir, "SKILL.md");
  if (!import_fs2.default.existsSync(skillMdSource)) {
    throw new Error("SKILL.md is required but not found");
  }
  import_fs2.default.copyFileSync(skillMdSource, import_path2.default.join(targetDir, "SKILL.md"));
  console.log("  \u2713 Copied SKILL.md");
  const filesToCopy = config.files || {};
  for (const [source, dest] of Object.entries(filesToCopy)) {
    const sourcePath = import_path2.default.join(sourceDir, source);
    if (!import_fs2.default.existsSync(sourcePath)) {
      console.warn(`  \u26A0 Warning: ${source} not found, skipping`);
      continue;
    }
    const destPath = import_path2.default.join(targetDir, dest);
    if (import_fs2.default.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
      console.log(`  \u2713 Copied directory: ${source}`);
    } else {
      const destDir = import_path2.default.dirname(destPath);
      ensureDir(destDir);
      import_fs2.default.copyFileSync(sourcePath, destPath);
      console.log(`  \u2713 Copied file: ${source}`);
    }
  }
  updateManifest(location.base, config, target.name, isRemote);
  if ((_a = config.hooks) == null ? void 0 : _a.postinstall) {
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
