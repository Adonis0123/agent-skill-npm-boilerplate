import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import ora from 'ora';
import type { InstallOptions, Platform, InstallRecord } from '../types.js';
import { PLATFORMS, PLATFORM_CONFIGS } from '../types.js';
import {
  classifySource,
  extractSkillName,
  getSkillsDir,
  getSkillInstallDir,
  copyDir,
  removeDir,
  cloneFromRemote,
  ensureDir,
  readSkillMd,
  parseSkillFrontmatter,
  writeInstallRecord,
} from '../utils.js';

export async function install(
  source: string,
  options: InstallOptions
): Promise<void> {
  const spinner = ora();

  try {
    // Determine target platforms
    let targetPlatforms: Platform[];
    if (options.all) {
      targetPlatforms = [...PLATFORMS];
    } else if (options.target) {
      if (!PLATFORMS.includes(options.target)) {
        console.error(
          chalk.red(`Invalid platform: ${options.target}`)
        );
        console.error(
          chalk.dim(`Valid platforms: ${PLATFORMS.join(', ')}`)
        );
        process.exit(1);
      }
      targetPlatforms = [options.target];
    } else {
      targetPlatforms = ['claude']; // Default to Claude
    }

    const scope = options.local ? 'local' : 'global';
    const sourceType = classifySource(source);
    const skillName = extractSkillName(source);

    console.log();
    console.log(chalk.bold('📦 Installing Skill'));
    console.log(chalk.dim(`   Source: ${source}`));
    console.log(chalk.dim(`   Name: ${skillName}`));
    console.log(chalk.dim(`   Type: ${sourceType}`));
    console.log(
      chalk.dim(
        `   Targets: ${targetPlatforms.map((p) => PLATFORM_CONFIGS[p].displayName).join(', ')}`
      )
    );
    console.log(chalk.dim(`   Scope: ${scope}`));
    console.log();

    // Create temp directory for fetching
    const tempDir = path.join(os.tmpdir(), `skill-install-${Date.now()}`);
    ensureDir(tempDir);

    try {
      // Fetch skill content
      spinner.start('Fetching skill...');

      if (sourceType === 'local') {
        const localPath = path.resolve(source);
        copyDir(localPath, tempDir);
      } else if (sourceType === 'npm') {
        // For npm packages, use npm pack and extract
        throw new Error('npm source not yet supported');
      } else {
        // GitHub URL or degit shorthand
        await cloneFromRemote(source, tempDir);
      }

      // Verify SKILL.md exists
      const skillMd = readSkillMd(tempDir);
      if (!skillMd) {
        spinner.fail('SKILL.md not found in source');
        process.exit(1);
      }

      const frontmatter = parseSkillFrontmatter(skillMd);
      spinner.succeed(
        `Fetched: ${frontmatter.name || skillName} ${frontmatter.version ? `v${frontmatter.version}` : ''}`
      );

      // Install to each target platform
      const results: { platform: Platform; path: string; success: boolean }[] =
        [];

      for (const platform of targetPlatforms) {
        const installDir = getSkillInstallDir(platform, scope, skillName);

        // Check if already installed
        if (fs.existsSync(installDir) && !options.force) {
          console.log(
            chalk.yellow(
              `   ⚠ ${PLATFORM_CONFIGS[platform].displayName}: Already installed (use --force to overwrite)`
            )
          );
          results.push({ platform, path: installDir, success: false });
          continue;
        }

        spinner.start(
          `Installing to ${PLATFORM_CONFIGS[platform].displayName}...`
        );

        try {
          // Ensure skills directory exists
          ensureDir(getSkillsDir(platform, scope));

          // Remove existing if force
          if (fs.existsSync(installDir)) {
            removeDir(installDir);
          }

          // Copy skill files
          copyDir(tempDir, installDir);

          // Write install record
          const record: InstallRecord = {
            name: skillName,
            source,
            sourceType,
            platform,
            scope,
            installedAt: new Date().toISOString(),
            installDir,
            frontmatter,
          };
          writeInstallRecord(installDir, record);

          spinner.succeed(
            `${PLATFORM_CONFIGS[platform].displayName}: ${chalk.dim(installDir)}`
          );
          results.push({ platform, path: installDir, success: true });
        } catch (error) {
          spinner.fail(
            `${PLATFORM_CONFIGS[platform].displayName}: ${(error as Error).message}`
          );
          results.push({ platform, path: installDir, success: false });
        }
      }

      // Summary
      console.log();
      const successful = results.filter((r) => r.success);
      if (successful.length > 0) {
        console.log(
          chalk.green(
            `✅ Installed to ${successful.length} platform${successful.length > 1 ? 's' : ''}`
          )
        );
      } else {
        console.log(chalk.yellow('⚠ No platforms were updated'));
      }
    } finally {
      // Cleanup temp directory
      removeDir(tempDir);
    }
  } catch (error) {
    spinner.fail((error as Error).message);
    process.exit(1);
  }
}
