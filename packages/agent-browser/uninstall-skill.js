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

// shared/src/uninstall-skill.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));

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

// shared/src/uninstall-skill.ts
function updateManifest(skillsDir, config) {
  const manifestPath = import_path2.default.join(skillsDir, ".skills-manifest.json");
  if (!import_fs2.default.existsSync(manifestPath)) {
    return;
  }
  try {
    const manifest = JSON.parse(import_fs2.default.readFileSync(manifestPath, "utf-8"));
    if (manifest.skills && manifest.skills[config.name]) {
      delete manifest.skills[config.name];
      import_fs2.default.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log("  \u2713 Updated manifest");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("  Warning: Could not update manifest:", message);
  }
}
function uninstallFromTarget(target, config) {
  console.log(`
\u{1F5D1}\uFE0F  Uninstalling from ${target.name}...`);
  const isGlobal = isGlobalInstall();
  const location = detectInstallLocation(target.paths, isGlobal);
  const skillName = extractSkillName(config.name);
  const skillNameTargetDir = import_path2.default.join(location.base, skillName);
  const fullPackageNameTargetDir = import_path2.default.join(location.base, config.name);
  let removed = false;
  if (import_fs2.default.existsSync(skillNameTargetDir)) {
    removeDir(skillNameTargetDir);
    console.log(`  \u2713 Removed skill directory: ${skillName}`);
    removed = true;
  }
  if (import_fs2.default.existsSync(fullPackageNameTargetDir) && fullPackageNameTargetDir !== skillNameTargetDir) {
    removeDir(fullPackageNameTargetDir);
    console.log(`  \u2713 Removed skill directory: ${config.name}`);
    removed = true;
  }
  updateManifest(location.base, config);
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
