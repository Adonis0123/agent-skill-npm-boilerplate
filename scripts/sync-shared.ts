#!/usr/bin/env npx tsx

/**
 * Sync shared TypeScript code to all skill packages
 *
 * This script:
 * 1. Finds all packages with .claude-skill.json
 * 2. Compiles shared TypeScript to bundled JavaScript using esbuild
 * 3. Copies the bundled files to each package
 *
 * Usage: pnpm sync
 */

import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

interface PackageInfo {
  name: string;
  dir: string;
  hasRemoteSource: boolean;
}

interface SkillConfig {
  name: string;
  remoteSource?: string;
}

/**
 * Find all packages that have .claude-skill.json
 */
function findSkillPackages(): PackageInfo[] {
  const packagesDir = path.join(ROOT_DIR, 'packages');

  if (!fs.existsSync(packagesDir)) {
    console.error('❌ packages/ directory not found');
    process.exit(1);
  }

  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  return dirs
    .filter((dir) => dir.isDirectory())
    .map((dir) => {
      const pkgDir = path.join(packagesDir, dir.name);
      const configPath = path.join(pkgDir, '.claude-skill.json');

      if (!fs.existsSync(configPath)) {
        return null;
      }

      try {
        const config: SkillConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return {
          name: dir.name,
          dir: pkgDir,
          hasRemoteSource: !!config.remoteSource,
        };
      } catch (error) {
        console.warn(`⚠ Could not parse ${configPath}, skipping`);
        return null;
      }
    })
    .filter((pkg): pkg is PackageInfo => pkg !== null);
}

/**
 * Build and sync shared code to all packages
 */
async function buildAndSync(): Promise<void> {
  console.log('🔄 Syncing shared code to packages...\n');

  const packages = findSkillPackages();

  if (packages.length === 0) {
    console.warn('⚠ No packages with .claude-skill.json found');
    return;
  }

  console.log('Found packages:');
  packages.forEach((pkg) => {
    const mode = pkg.hasRemoteSource ? 'remote' : 'local';
    console.log(`  • ${pkg.name} (${mode} mode)`);
  });
  console.log();

  const sharedDir = path.join(ROOT_DIR, 'shared', 'src');

  // Verify shared source exists
  if (!fs.existsSync(sharedDir)) {
    console.error('❌ shared/src/ directory not found');
    process.exit(1);
  }

  // Build for each package
  for (const pkg of packages) {
    console.log(`📦 Building for ${pkg.name}...`);

    try {
      // Build install-skill.js
      await esbuild.build({
        entryPoints: [path.join(sharedDir, 'install-skill.ts')],
        bundle: true,
        platform: 'node',
        target: 'node16',
        format: 'cjs', // CommonJS for npm postinstall compatibility
        outfile: path.join(pkg.dir, 'install-skill.js'),
        banner: {
          js: '#!/usr/bin/env node',
        },
        // Define __dirname for the bundled code
        define: {
          // This will be replaced at runtime
        },
        logLevel: 'warning',
      });
      console.log('  ✓ install-skill.js');

      // Build uninstall-skill.js
      await esbuild.build({
        entryPoints: [path.join(sharedDir, 'uninstall-skill.ts')],
        bundle: true,
        platform: 'node',
        target: 'node16',
        format: 'cjs',
        outfile: path.join(pkg.dir, 'uninstall-skill.js'),
        banner: {
          js: '#!/usr/bin/env node',
        },
        logLevel: 'warning',
      });
      console.log('  ✓ uninstall-skill.js');

      // Remove old utils.js if it exists (no longer needed as code is bundled)
      const oldUtilsPath = path.join(pkg.dir, 'utils.js');
      if (fs.existsSync(oldUtilsPath)) {
        fs.unlinkSync(oldUtilsPath);
        console.log('  ✓ Removed old utils.js (now bundled)');
      }

      console.log(`  ✅ ${pkg.name} synced\n`);
    } catch (error) {
      console.error(`  ❌ Failed to build for ${pkg.name}:`, error);
    }
  }

  console.log('='.repeat(50));
  console.log('✅ Sync complete!');
  console.log('='.repeat(50));
}

// Run
buildAndSync().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
