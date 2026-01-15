import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import type { SkillConfig, EnabledTarget, InstallResult } from './types.js';
import {
  getEnabledTargets,
  extractSkillName,
  detectInstallLocation,
  isGlobalInstall,
  copyDir,
  ensureDir,
  readSkillConfig,
  removeDir,
} from './utils.js';

/**
 * Fetch skill files from remote repository using degit
 * @returns true if fetch was successful
 */
function fetchFromRemote(tempDir: string, remoteSource: string): boolean {
  try {
    console.log(`  🌐 Fetching latest from ${remoteSource}...`);

    execSync(`npx degit ${remoteSource} "${tempDir}" --force`, {
      stdio: 'pipe',
      timeout: 60000,
    });

    if (fs.existsSync(path.join(tempDir, 'SKILL.md'))) {
      console.log('  ✓ Fetched latest version from remote');
      return true;
    }

    console.warn('  ⚠ Remote fetch succeeded but SKILL.md not found');
    return false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`  ⚠ Could not fetch from remote: ${message}`);
    console.log('  ℹ Using bundled version as fallback');
    return false;
  }
}

interface SourceInfo {
  sourceDir: string;
  cleanup: () => void;
  isRemote: boolean;
}

/**
 * Get the source directory for skill files
 * Tries remote first if configured, falls back to local bundled files
 */
function getSourceDir(config: SkillConfig, packageDir: string): SourceInfo {
  if (!config.remoteSource) {
    return {
      sourceDir: packageDir,
      cleanup: () => {},
      isRemote: false,
    };
  }

  const tempDir = path.join(os.tmpdir(), `skill-fetch-${Date.now()}`);
  const remoteSuccess = fetchFromRemote(tempDir, config.remoteSource);

  if (remoteSuccess) {
    return {
      sourceDir: tempDir,
      cleanup: () => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      },
      isRemote: true,
    };
  }

  // Cleanup temp dir if remote failed
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore
  }

  return {
    sourceDir: packageDir,
    cleanup: () => {},
    isRemote: false,
  };
}

/**
 * Update the skills manifest file
 */
function updateManifest(
  skillsDir: string,
  config: SkillConfig,
  targetName: string,
  isRemote: boolean
): void {
  const manifestPath = path.join(skillsDir, '.skills-manifest.json');
  let manifest: { skills: Record<string, unknown> } = { skills: {} };

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      console.warn('  Warning: Could not parse existing manifest, creating new one');
      manifest = { skills: {} };
    }
  }

  const skillName = extractSkillName(config.name);

  manifest.skills[config.name] = {
    version: config.version,
    installedAt: new Date().toISOString(),
    package: config.package || config.name,
    path: path.join(skillsDir, skillName),
    target: targetName,
    ...(config.remoteSource && { source: config.remoteSource }),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Install skill to a specific target
 */
function installToTarget(
  target: EnabledTarget,
  config: SkillConfig,
  sourceDir: string,
  isRemote: boolean
): string {
  console.log(`\n📦 Installing to ${target.name}...`);

  const isGlobal = isGlobalInstall();
  const location = detectInstallLocation(target.paths, isGlobal);
  const skillName = extractSkillName(config.name);
  const targetDir = path.join(location.base, skillName);
  const altTargetDir = path.join(location.base, config.name);

  console.log(`  Type: ${location.type}${isGlobal ? ' (global)' : ' (project)'}`);
  console.log(`  Directory: ${targetDir}`);

  // Clean up alternative path format (with scope)
  if (fs.existsSync(altTargetDir) && altTargetDir !== targetDir) {
    console.log('  🧹 Cleaning up alternative path format...');
    removeDir(altTargetDir);
    console.log(`  ✓ Removed directory: ${config.name}`);
  }

  // Create target directory
  ensureDir(targetDir);

  // Copy SKILL.md (required)
  const skillMdSource = path.join(sourceDir, 'SKILL.md');
  if (!fs.existsSync(skillMdSource)) {
    throw new Error('SKILL.md is required but not found');
  }
  fs.copyFileSync(skillMdSource, path.join(targetDir, 'SKILL.md'));
  console.log('  ✓ Copied SKILL.md');

  // Copy additional files
  const filesToCopy = config.files || {};
  for (const [source, dest] of Object.entries(filesToCopy)) {
    const sourcePath = path.join(sourceDir, source);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`  ⚠ Warning: ${source} not found, skipping`);
      continue;
    }

    const destPath = path.join(targetDir, dest);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
      console.log(`  ✓ Copied directory: ${source}`);
    } else {
      const destDir = path.dirname(destPath);
      ensureDir(destDir);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ Copied file: ${source}`);
    }
  }

  // Update manifest
  updateManifest(location.base, config, target.name, isRemote);

  // Run postinstall hooks
  if (config.hooks?.postinstall) {
    console.log('  🔧 Running postinstall hook...');
    try {
      execSync(config.hooks.postinstall, {
        cwd: targetDir,
        stdio: 'pipe',
      });
      console.log('  ✓ Postinstall hook completed');
    } catch {
      console.warn('  ⚠ Warning: postinstall hook failed');
    }
  }

  console.log(`  ✅ Installed to ${target.name}`);
  return targetDir;
}

/**
 * Main installation function
 */
function installSkill(): void {
  console.log('🚀 Installing AI Coding Skill...\n');

  // __dirname is the directory where this script is located (the package directory)
  const packageDir = __dirname;
  const config = readSkillConfig(packageDir);

  const enabledTargets = getEnabledTargets(config);

  if (enabledTargets.length === 0) {
    console.warn('⚠ No targets enabled in configuration');
    console.warn('Please enable at least one target in .claude-skill.json');
    return;
  }

  console.log(`Installing skill "${config.name}" to ${enabledTargets.length} target(s):`);
  enabledTargets.forEach((target) => {
    console.log(`  • ${target.name}`);
  });

  // Get source directory (remote or local)
  const { sourceDir, cleanup, isRemote } = getSourceDir(config, packageDir);

  if (isRemote) {
    console.log(`\n📡 Source: Remote (${config.remoteSource})`);
  } else {
    console.log('\n📦 Source: Bundled (local)');
  }

  try {
    const installedPaths: InstallResult[] = [];

    for (const target of enabledTargets) {
      try {
        const installPath = installToTarget(target, config, sourceDir, isRemote);
        installedPaths.push({ target: target.name, path: installPath });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Failed to install to ${target.name}:`, message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Installation Complete!');
    console.log('='.repeat(60));

    if (installedPaths.length > 0) {
      console.log('\nInstalled to:');
      installedPaths.forEach(({ target, path: installPath }) => {
        console.log(`  • ${target}: ${installPath}`);
      });

      console.log('\n📖 Next Steps:');
      console.log('  1. Restart your AI coding tool(s)');
      console.log('  2. Ask: "What skills are available?"');
      console.log('  3. Start using your skill!');
    }
  } finally {
    cleanup();
  }
}

// Execute installation
try {
  installSkill();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('\n❌ Failed to install skill:', message);
  console.error('\nTroubleshooting:');
  console.error('- Ensure .claude-skill.json exists and is valid JSON');
  console.error('- Ensure SKILL.md exists');
  console.error('- Check file permissions for target directories');
  console.error('- Verify at least one target is enabled in .claude-skill.json');
  console.error('- Try running with sudo for global installation (if needed)');
  process.exit(1);
}
