import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import ora from 'ora';
import type { UpdateOptions, Platform, InstallRecord } from '../types.js';
import { PLATFORMS, PLATFORM_CONFIGS } from '../types.js';
import {
  getSkillsDir,
  getSkillInstallDir,
  readInstallRecord,
  writeInstallRecord,
  copyDir,
  removeDir,
  cloneFromRemote,
  ensureDir,
  readSkillMd,
  parseSkillFrontmatter,
} from '../utils.js';

export async function update(
  skillName: string | undefined,
  options: UpdateOptions
): Promise<void> {
  const platform = (options.target || 'claude') as Platform;
  const scope = options.local ? 'local' : 'global';
  const spinner = ora();

  if (!PLATFORMS.includes(platform)) {
    console.error(chalk.red(`Invalid platform: ${platform}`));
    console.error(chalk.dim(`Valid platforms: ${PLATFORMS.join(', ')}`));
    process.exit(1);
  }

  // Get skills to update
  let skillsToUpdate: string[] = [];

  if (skillName) {
    // Update specific skill
    const installDir = getSkillInstallDir(platform, scope, skillName);
    if (!fs.existsSync(installDir)) {
      console.error(chalk.red(`Skill "${skillName}" not found`));
      process.exit(1);
    }
    skillsToUpdate = [skillName];
  } else {
    // Update all skills
    const skillsDir = getSkillsDir(platform, scope);
    if (!fs.existsSync(skillsDir)) {
      console.log(chalk.dim('No skills installed.'));
      return;
    }

    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    skillsToUpdate = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name);
  }

  if (skillsToUpdate.length === 0) {
    console.log(chalk.dim('No skills to update.'));
    return;
  }

  console.log();
  console.log(
    chalk.bold(
      `🔄 Updating ${skillsToUpdate.length} skill${skillsToUpdate.length > 1 ? 's' : ''}`
    )
  );
  console.log();

  let updated = 0;
  let failed = 0;

  for (const name of skillsToUpdate) {
    const installDir = getSkillInstallDir(platform, scope, name);
    const record = readInstallRecord(installDir);

    if (!record) {
      console.log(
        chalk.yellow(`  ⚠ ${name}: No install record, skipping`)
      );
      continue;
    }

    if (record.sourceType === 'local') {
      console.log(
        chalk.dim(`  ⏭ ${name}: Local source, skipping`)
      );
      continue;
    }

    spinner.start(`Updating ${name}...`);

    try {
      // Create temp directory
      const tempDir = path.join(os.tmpdir(), `skill-update-${Date.now()}`);
      ensureDir(tempDir);

      try {
        // Fetch latest version
        await cloneFromRemote(record.source, tempDir);

        // Verify SKILL.md exists
        const skillMd = readSkillMd(tempDir);
        if (!skillMd) {
          spinner.fail(`${name}: SKILL.md not found in source`);
          failed++;
          continue;
        }

        const frontmatter = parseSkillFrontmatter(skillMd);

        // Remove old installation
        removeDir(installDir);

        // Copy new files
        copyDir(tempDir, installDir);

        // Update install record
        const newRecord: InstallRecord = {
          ...record,
          updatedAt: new Date().toISOString(),
          frontmatter,
        };
        writeInstallRecord(installDir, newRecord);

        const version = frontmatter.version
          ? chalk.dim(`v${frontmatter.version}`)
          : '';
        spinner.succeed(`${name} ${version}`);
        updated++;
      } finally {
        removeDir(tempDir);
      }
    } catch (error) {
      spinner.fail(`${name}: ${(error as Error).message}`);
      failed++;
    }
  }

  console.log();
  if (updated > 0) {
    console.log(
      chalk.green(`✅ Updated ${updated} skill${updated > 1 ? 's' : ''}`)
    );
  }
  if (failed > 0) {
    console.log(
      chalk.red(`❌ Failed to update ${failed} skill${failed > 1 ? 's' : ''}`)
    );
  }
  console.log();
}
