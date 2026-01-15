import fs from 'fs';
import path from 'path';
import type { SkillConfig, EnabledTarget, UninstallResult } from './types.js';
import {
  getEnabledTargets,
  extractSkillName,
  detectInstallLocation,
  isGlobalInstall,
  removeDir,
  readSkillConfig,
} from './utils.js';

/**
 * Update manifest to remove skill entry
 */
function updateManifest(skillsDir: string, config: SkillConfig): void {
  const manifestPath = path.join(skillsDir, '.skills-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    if (manifest.skills && manifest.skills[config.name]) {
      delete manifest.skills[config.name];
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('  ✓ Updated manifest');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('  Warning: Could not update manifest:', message);
  }
}

/**
 * Uninstall skill from a specific target
 */
function uninstallFromTarget(target: EnabledTarget, config: SkillConfig): boolean {
  console.log(`\n🗑️  Uninstalling from ${target.name}...`);

  const isGlobal = isGlobalInstall();
  const location = detectInstallLocation(target.paths, isGlobal);
  const skillName = extractSkillName(config.name);

  // Path format using skill name
  const skillNameTargetDir = path.join(location.base, skillName);
  // Path format with full package name (including scope)
  const fullPackageNameTargetDir = path.join(location.base, config.name);

  let removed = false;

  // Check and remove path using skill name
  if (fs.existsSync(skillNameTargetDir)) {
    removeDir(skillNameTargetDir);
    console.log(`  ✓ Removed skill directory: ${skillName}`);
    removed = true;
  }

  // Check and remove path with full package name (for compatibility)
  if (fs.existsSync(fullPackageNameTargetDir) && fullPackageNameTargetDir !== skillNameTargetDir) {
    removeDir(fullPackageNameTargetDir);
    console.log(`  ✓ Removed skill directory: ${config.name}`);
    removed = true;
  }

  // Update manifest
  updateManifest(location.base, config);

  if (removed) {
    console.log(`  ✅ Uninstalled from ${target.name}`);
    return true;
  } else {
    console.log(`  ℹ️  Skill was not installed in ${target.name}`);
    return false;
  }
}

/**
 * Main uninstall function
 */
function uninstallSkill(): void {
  console.log('🗑️  Uninstalling AI Coding Skill...\n');

  // __dirname is the directory where this script is located (the package directory)
  const packageDir = __dirname;

  let config: SkillConfig;
  try {
    config = readSkillConfig(packageDir);
  } catch {
    console.warn('Warning: .claude-skill.json not found, skipping cleanup');
    return;
  }

  const enabledTargets = getEnabledTargets(config);

  console.log(`Uninstalling skill "${config.name}" from ${enabledTargets.length} target(s):`);
  enabledTargets.forEach((target) => {
    console.log(`  • ${target.name}`);
  });

  const uninstalledFrom: string[] = [];

  for (const target of enabledTargets) {
    try {
      const success = uninstallFromTarget(target, config);
      if (success) {
        uninstalledFrom.push(target.name);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Failed to uninstall from ${target.name}:`, message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (uninstalledFrom.length > 0) {
    console.log('✅ Uninstallation Complete!');
    console.log('='.repeat(60));
    console.log('\nUninstalled from:');
    uninstalledFrom.forEach((target) => {
      console.log(`  • ${target}`);
    });
  } else {
    console.log('ℹ️  Skill was not installed');
    console.log('='.repeat(60));
  }
}

// Execute uninstall
try {
  uninstallSkill();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('\n⚠️  Warning during uninstall:', message);
  // Don't exit with error code as uninstall should be best-effort
}
