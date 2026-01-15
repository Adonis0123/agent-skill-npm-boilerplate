import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import type { UninstallOptions, Platform } from '../types.js';
import { PLATFORMS, PLATFORM_CONFIGS } from '../types.js';
import {
  getSkillInstallDir,
  readInstallRecord,
  removeDir,
} from '../utils.js';

export async function uninstall(
  skillName: string,
  options: UninstallOptions
): Promise<void> {
  const platform = (options.target || 'claude') as Platform;
  const scope = options.local ? 'local' : 'global';
  const spinner = ora();

  if (!PLATFORMS.includes(platform)) {
    console.error(chalk.red(`Invalid platform: ${platform}`));
    console.error(chalk.dim(`Valid platforms: ${PLATFORMS.join(', ')}`));
    process.exit(1);
  }

  const installDir = getSkillInstallDir(platform, scope, skillName);

  if (!fs.existsSync(installDir)) {
    console.error(chalk.red(`Skill "${skillName}" not found`));
    console.error(chalk.dim(`Looked in: ${installDir}`));
    process.exit(1);
  }

  const record = readInstallRecord(installDir);

  if (!record && !options.force) {
    console.error(
      chalk.red(`Skill "${skillName}" has no install record`)
    );
    console.error(chalk.dim('Use --force to uninstall anyway'));
    process.exit(1);
  }

  console.log();
  console.log(chalk.bold(`🗑️  Uninstalling ${skillName}`));
  console.log(
    chalk.dim(`   Platform: ${PLATFORM_CONFIGS[platform].displayName}`)
  );
  console.log(chalk.dim(`   Location: ${installDir}`));
  console.log();

  spinner.start('Removing skill...');

  try {
    removeDir(installDir);
    spinner.succeed('Skill removed');

    console.log();
    console.log(chalk.green(`✅ Uninstalled ${skillName}`));
    console.log();
  } catch (error) {
    spinner.fail((error as Error).message);
    process.exit(1);
  }
}
