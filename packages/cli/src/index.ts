#!/usr/bin/env node

/**
 * Skill CLI - Manage AI Agent Skills
 * Install, update, list, and manage skills for Claude Code, Cursor, Codex, and more
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';
import { install } from './commands/install.js';
import { list } from './commands/list.js';
import { info } from './commands/info.js';
import { update } from './commands/update.js';
import { uninstall } from './commands/uninstall.js';
import { PLATFORMS } from './types.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const program = new Command();

program
  .name('skill')
  .description(
    'Manage AI Agent Skills — Install, update, list, and manage skills for Claude Code, Cursor, Codex, and more.'
  )
  .version(version);

program
  .command('install <source>')
  .alias('i')
  .description(
    'Install a Skill from a Git URL, degit shorthand, or local directory'
  )
  .option('-t, --target <platform>', `Target platform: ${PLATFORMS.join(', ')}`)
  .option('--all', `Install to all platforms: ${PLATFORMS.join(', ')}`)
  .option('-l, --local', 'Install to project-level directory instead of global')
  .option('-f, --force', 'Overwrite existing installation')
  .action(async (source: string, options: any) => {
    await install(source, options);
  });

program
  .command('list')
  .alias('ls')
  .description('List installed Skills')
  .option(
    '-t, --target <platform>',
    `Target platform: ${PLATFORMS.join(', ')} (optional; omit to list all)`
  )
  .option('-l, --local', 'List project-level directory instead of global')
  .option('--paths', 'Show install paths')
  .option('--json', 'Output JSON')
  .action(async (options: any) => list(options));

program
  .command('info <skill>')
  .description('Show installed Skill details')
  .option(
    '-t, --target <platform>',
    `Target platform: ${PLATFORMS.join(', ')}`,
    'claude'
  )
  .option('-l, --local', 'Use project-level directory instead of global')
  .option('--json', 'Output JSON')
  .action(async (skill: string, options: any) => info(skill, options));

program
  .command('update [skill]')
  .alias('up')
  .description('Update one or all installed Skills')
  .option(
    '-t, --target <platform>',
    `Target platform: ${PLATFORMS.join(', ')}`,
    'claude'
  )
  .option('-l, --local', 'Use project-level directory instead of global')
  .action(async (skill: string | undefined, options: any) =>
    update(skill, options)
  );

program
  .command('uninstall <skill>')
  .alias('rm')
  .description('Uninstall a Skill')
  .option(
    '-t, --target <platform>',
    `Target platform: ${PLATFORMS.join(', ')}`,
    'claude'
  )
  .option('-l, --local', 'Use project-level directory instead of global')
  .option('-f, --force', 'Uninstall even if metadata is missing')
  .action(async (skill: string, options: any) => uninstall(skill, options));

// Default action: show help
program.action(() => {
  console.log(chalk.bold('\n🛠️  skill — Manage AI Agent Skills\n'));
  program.outputHelp();
});

program.parse();
