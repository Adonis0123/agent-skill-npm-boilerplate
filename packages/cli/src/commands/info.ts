import fs from 'fs';
import chalk from 'chalk';
import type { Platform } from '../types.js';
import { PLATFORMS, PLATFORM_CONFIGS } from '../types.js';
import {
  getSkillInstallDir,
  readInstallRecord,
  readSkillMd,
  parseSkillFrontmatter,
} from '../utils.js';

interface InfoOptions {
  target?: Platform;
  local?: boolean;
  json?: boolean;
}

export async function info(
  skillName: string,
  options: InfoOptions
): Promise<void> {
  const platform = options.target || 'claude';
  const scope = options.local ? 'local' : 'global';

  if (!PLATFORMS.includes(platform)) {
    console.error(chalk.red(`Invalid platform: ${platform}`));
    console.error(chalk.dim(`Valid platforms: ${PLATFORMS.join(', ')}`));
    process.exit(1);
  }

  const installDir = getSkillInstallDir(platform, scope, skillName);

  if (!fs.existsSync(installDir)) {
    console.error(chalk.red(`Skill "${skillName}" not found`));
    console.error(
      chalk.dim(
        `Looked in: ${installDir}`
      )
    );
    process.exit(1);
  }

  const record = readInstallRecord(installDir);
  const skillMd = readSkillMd(installDir);
  const frontmatter = skillMd ? parseSkillFrontmatter(skillMd) : null;

  const info = {
    name: skillName,
    platform,
    scope,
    installDir,
    version: frontmatter?.version || record?.frontmatter?.version,
    description: frontmatter?.description || record?.frontmatter?.description,
    author: frontmatter?.author || record?.frontmatter?.author,
    source: record?.source,
    sourceType: record?.sourceType,
    installedAt: record?.installedAt,
    updatedAt: record?.updatedAt,
    hasSkillMd: !!skillMd,
  };

  if (options.json) {
    console.log(JSON.stringify(info, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold(`📦 ${info.name}`));
  console.log();

  if (info.version) {
    console.log(`  ${chalk.dim('Version:')}     ${info.version}`);
  }
  if (info.description) {
    console.log(`  ${chalk.dim('Description:')} ${info.description}`);
  }
  if (info.author) {
    console.log(`  ${chalk.dim('Author:')}      ${info.author}`);
  }

  console.log();
  console.log(`  ${chalk.dim('Platform:')}    ${PLATFORM_CONFIGS[platform].displayName}`);
  console.log(`  ${chalk.dim('Scope:')}       ${info.scope}`);
  console.log(`  ${chalk.dim('Location:')}    ${info.installDir}`);

  if (info.source) {
    console.log(`  ${chalk.dim('Source:')}      ${info.source}`);
  }
  if (info.sourceType) {
    console.log(`  ${chalk.dim('Source Type:')} ${info.sourceType}`);
  }

  console.log();
  if (info.installedAt) {
    console.log(
      `  ${chalk.dim('Installed:')}   ${new Date(info.installedAt).toLocaleString()}`
    );
  }
  if (info.updatedAt) {
    console.log(
      `  ${chalk.dim('Updated:')}     ${new Date(info.updatedAt).toLocaleString()}`
    );
  }

  console.log();
}
