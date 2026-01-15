#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const { getEnabledTargets, extractSkillName, detectInstallLocation } = require('./utils');

// Default remote source (can be overridden in .claude-skill.json)
const DEFAULT_REMOTE_SOURCE = 'vercel-labs/agent-skills/skills/react-best-practices';

/**
 * Fetch skill files from remote repository using degit
 * @param {string} tempDir - Temporary directory to clone into
 * @param {string} remoteSource - Remote source path (degit format)
 * @returns {boolean} - Whether fetch was successful
 */
function fetchFromRemote(tempDir, remoteSource) {
  try {
    console.log(`  🌐 Fetching latest from ${remoteSource}...`);

    // Use npx degit to clone without git history
    execSync(`npx degit ${remoteSource} "${tempDir}" --force`, {
      stdio: 'pipe',
      timeout: 60000 // 60 second timeout
    });

    // Verify SKILL.md exists in fetched content
    if (fs.existsSync(path.join(tempDir, 'SKILL.md'))) {
      console.log('  ✓ Fetched latest version from remote');
      return true;
    }

    console.warn('  ⚠ Remote fetch succeeded but SKILL.md not found');
    return false;
  } catch (error) {
    console.warn(`  ⚠ Could not fetch from remote: ${error.message}`);
    console.log('  ℹ Using bundled version as fallback');
    return false;
  }
}

/**
 * Get the source directory for skill files
 * Tries remote first, falls back to local bundled files
 * @param {string} remoteSource - Remote source to fetch from
 * @returns {{ sourceDir: string, cleanup: () => void, isRemote: boolean }}
 */
function getSourceDir(remoteSource) {
  // Create temp directory for remote fetch
  const tempDir = path.join(os.tmpdir(), `skill-fetch-${Date.now()}`);

  // Try to fetch from remote
  const remoteSuccess = fetchFromRemote(tempDir, remoteSource);

  if (remoteSuccess) {
    return {
      sourceDir: tempDir,
      cleanup: () => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      },
      isRemote: true
    };
  }

  // Cleanup temp dir if remote failed
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {
    // Ignore
  }

  // Fall back to local bundled files
  return {
    sourceDir: __dirname,
    cleanup: () => {},
    isRemote: false
  };
}

function installToTarget(target, config, sourceDir) {
  console.log(`\n📦 Installing to ${target.name}...`);

  // Check if this is a global installation
  const isGlobal = process.env.npm_config_global === 'true';

  // Determine installation location
  const location = detectInstallLocation(target.paths, isGlobal);

  // Extract skill name from package name (remove scope prefix)
  const skillName = extractSkillName(config.name);

  const targetDir = path.join(location.base, skillName);

  // Alternative path format with full package name (including scope)
  const altTargetDir = path.join(location.base, config.name);

  console.log(`  Type: ${location.type}${isGlobal ? ' (global)' : ' (project)'}`);
  console.log(`  Directory: ${targetDir}`);

  // Clean up alternative path format
  if (fs.existsSync(altTargetDir) && altTargetDir !== targetDir) {
    console.log(`  🧹 Cleaning up alternative path format...`);
    fs.rmSync(altTargetDir, { recursive: true, force: true });
    console.log(`  ✓ Removed directory: ${config.name}`);
  }

  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy SKILL.md (required)
  const skillMdSource = path.join(sourceDir, 'SKILL.md');
  if (!fs.existsSync(skillMdSource)) {
    throw new Error('SKILL.md is required but not found');
  }
  fs.copyFileSync(skillMdSource, path.join(targetDir, 'SKILL.md'));
  console.log('  ✓ Copied SKILL.md');

  // Copy other files from source directory
  const filesToCopy = config.files || {
    'AGENTS.md': 'AGENTS.md',
    'README.md': 'README.md',
    'rules': 'rules/'
  };

  Object.entries(filesToCopy).forEach(([source, dest]) => {
    const sourcePath = path.join(sourceDir, source);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`  ⚠ Warning: ${source} not found, skipping`);
      return;
    }

    const destPath = path.join(targetDir, dest);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
      console.log(`  ✓ Copied directory: ${source}`);
    } else {
      // Ensure target directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ Copied file: ${source}`);
    }
  });

  // Update manifest
  updateManifest(location.base, config, target.name);

  // Run postinstall hooks
  if (config.hooks && config.hooks.postinstall) {
    console.log('  🔧 Running postinstall hook...');
    try {
      execSync(config.hooks.postinstall, {
        cwd: targetDir,
        stdio: 'pipe'
      });
      console.log('  ✓ Postinstall hook completed');
    } catch (error) {
      console.warn(`  ⚠ Warning: postinstall hook failed`);
    }
  }

  console.log(`  ✅ Installed to ${target.name}`);
  return targetDir;
}

function installSkill() {
  console.log('🚀 Installing AI Coding Skill...\n');

  // Read configuration
  const configPath = path.join(__dirname, '.claude-skill.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('.claude-skill.json not found');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Get enabled targets
  const enabledTargets = getEnabledTargets(config);

  if (enabledTargets.length === 0) {
    console.warn('⚠ No targets enabled in configuration');
    console.warn('Please enable at least one target in .claude-skill.json');
    return;
  }

  console.log(`Installing skill "${config.name}" to ${enabledTargets.length} target(s):`);
  enabledTargets.forEach(target => {
    console.log(`  • ${target.name}`);
  });

  // Get remote source from config or use default
  const remoteSource = config.remoteSource || DEFAULT_REMOTE_SOURCE;

  // Get source directory (remote or local fallback)
  const { sourceDir, cleanup, isRemote } = getSourceDir(remoteSource);

  if (isRemote) {
    console.log(`\n📡 Source: Remote (${remoteSource})`);
  } else {
    console.log('\n📦 Source: Bundled (local fallback)');
  }

  try {
    // Install to all enabled targets
    const installedPaths = [];
    for (const target of enabledTargets) {
      try {
        const installPath = installToTarget(target, config, sourceDir);
        installedPaths.push({ target: target.name, path: installPath });
      } catch (error) {
        console.error(`\n❌ Failed to install to ${target.name}:`, error.message);
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
    // Cleanup temp directory
    cleanup();
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updateManifest(skillsDir, config, targetName) {
  const manifestPath = path.join(skillsDir, '.skills-manifest.json');
  let manifest = { skills: {} };

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      console.warn('  Warning: Could not parse existing manifest, creating new one');
      manifest = { skills: {} };
    }
  }

  // Extract skill name from package name (remove scope prefix)
  const skillName = config.name.startsWith('@') ?
    config.name.split('/')[1] || config.name :
    config.name;

  manifest.skills[config.name] = {
    version: config.version,
    installedAt: new Date().toISOString(),
    package: config.package || config.name,
    path: path.join(skillsDir, skillName),
    target: targetName,
    source: config.remoteSource || DEFAULT_REMOTE_SOURCE
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// Execute installation
try {
  installSkill();
} catch (error) {
  console.error('\n❌ Failed to install skill:', error.message);
  console.error('\nTroubleshooting:');
  console.error('- Ensure .claude-skill.json exists and is valid JSON');
  console.error('- Ensure SKILL.md exists');
  console.error('- Check file permissions for target directories');
  console.error('- Verify at least one target is enabled in .claude-skill.json');
  console.error('- Try running with sudo for global installation (if needed)');
  process.exit(1);
}
