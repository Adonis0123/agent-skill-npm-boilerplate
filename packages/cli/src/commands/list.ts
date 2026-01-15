import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ListOptions, Platform } from '../types.js';
import { PLATFORMS, PLATFORM_CONFIGS } from '../types.js';
import {
  getSkillsDir,
  readInstallRecord,
  readSkillMd,
  parseSkillFrontmatter,
} from '../utils.js';

interface ListedSkill {
  name: string;
  platform: Platform;
  scope: 'global' | 'local';
  installDir: string;
  version?: string;
  description?: string;
  source?: string;
  installedAt?: string;
}

export async function list(options: ListOptions): Promise<void> {
  const scope = options.local ? 'local' : 'global';

  // Determine which platforms to list
  let targetPlatforms: Platform[];
  if (options.target) {
    if (!PLATFORMS.includes(options.target)) {
      console.error(chalk.red(`Invalid platform: ${options.target}`));
      console.error(chalk.dim(`Valid platforms: ${PLATFORMS.join(', ')}`));
      process.exit(1);
    }
    targetPlatforms = [options.target];
  } else {
    targetPlatforms = [...PLATFORMS];
  }

  const allSkills: ListedSkill[] = [];

  // Collect skills from each platform
  for (const platform of targetPlatforms) {
    const skillsDir = getSkillsDir(platform, scope);

    if (!fs.existsSync(skillsDir)) {
      continue;
    }

    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue;
      }

      const skillDir = path.join(skillsDir, entry.name);
      const record = readInstallRecord(skillDir);
      const skillMd = readSkillMd(skillDir);
      const frontmatter = skillMd ? parseSkillFrontmatter(skillMd) : null;

      allSkills.push({
        name: entry.name,
        platform,
        scope,
        installDir: skillDir,
        version: frontmatter?.version || record?.frontmatter?.version,
        description:
          frontmatter?.description || record?.frontmatter?.description,
        source: record?.source,
        installedAt: record?.installedAt,
      });
    }
  }

  // Output
  if (options.json) {
    console.log(JSON.stringify(allSkills, null, 2));
    return;
  }

  if (allSkills.length === 0) {
    console.log();
    console.log(chalk.dim('No skills installed.'));
    console.log();
    console.log(chalk.dim('Install a skill with:'));
    console.log(chalk.cyan('  skill install anthropics/skills/skills/pdf'));
    console.log();
    return;
  }

  console.log();
  console.log(chalk.bold(`📚 Installed Skills (${scope})`));
  console.log();

  // Group by platform
  const byPlatform = new Map<Platform, ListedSkill[]>();
  for (const skill of allSkills) {
    const list = byPlatform.get(skill.platform) || [];
    list.push(skill);
    byPlatform.set(skill.platform, list);
  }

  for (const [platform, skills] of byPlatform) {
    console.log(
      chalk.bold(`${PLATFORM_CONFIGS[platform].displayName} (${skills.length})`)
    );

    for (const skill of skills) {
      const version = skill.version ? chalk.dim(`v${skill.version}`) : '';
      console.log(`  ${chalk.cyan(skill.name)} ${version}`);

      if (skill.description) {
        console.log(chalk.dim(`    ${skill.description.slice(0, 60)}${skill.description.length > 60 ? '...' : ''}`));
      }

      if (options.paths) {
        console.log(chalk.dim(`    ${skill.installDir}`));
      }
    }
    console.log();
  }

  console.log(chalk.dim(`Total: ${allSkills.length} skill${allSkills.length > 1 ? 's' : ''}`));
  console.log();
}
