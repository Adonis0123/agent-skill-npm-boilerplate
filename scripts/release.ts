#!/usr/bin/env npx tsx

/**
 * Interactive release script for publishing packages
 *
 * Features:
 * - Interactive version selection with keyboard navigation
 * - Preview version changes before publishing
 * - Automatic git commit and push
 *
 * Usage: pnpm release
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { select, confirm, Separator } from '@inquirer/prompts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

interface PackageJson {
  name: string;
  version: string;
}

interface VersionChoice {
  key: string;
  label: string;
  type: 'patch' | 'minor' | 'major';
  description: string;
}

const VERSION_CHOICES: VersionChoice[] = [
  {
    key: '1',
    label: 'patch',
    type: 'patch',
    description: '补丁版本 (bug 修复)',
  },
  {
    key: '2',
    label: 'minor',
    type: 'minor',
    description: '次版本 (新功能，向后兼容)',
  },
  {
    key: '3',
    label: 'major',
    type: 'major',
    description: '主版本 (破坏性变更)',
  },
];

/**
 * Get all package versions
 */
function getPackageVersions(): PackageJson[] {
  const packagesDir = path.join(ROOT_DIR, 'packages');
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  return dirs
    .filter((dir) => dir.isDirectory())
    .map((dir) => {
      const pkgPath = path.join(packagesDir, dir.name, 'package.json');
      if (!fs.existsSync(pkgPath)) return null;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return { name: pkg.name, version: pkg.version };
    })
    .filter((pkg): pkg is PackageJson => pkg !== null);
}

/**
 * Get git tags info
 */
function getGitTagsInfo(): { total: number; latest: string | null } {
  try {
    const tagsOutput = execSync('git tag --list', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    });
    const tags = tagsOutput.trim().split('\n').filter(Boolean);
    const total = tags.length;

    let latest: string | null = null;
    if (total > 0) {
      try {
        latest = execSync('git describe --tags --abbrev=0 2>/dev/null', {
          cwd: ROOT_DIR,
          encoding: 'utf-8',
        }).trim();
      } catch {
        latest = tags[tags.length - 1];
      }
    }

    return { total, latest };
  } catch {
    return { total: 0, latest: null };
  }
}

/**
 * Calculate next version
 */
function getNextVersion(
  current: string,
  type: 'patch' | 'minor' | 'major'
): string {
  const [major, minor, patch] = current.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Format version preview for a choice
 */
function formatVersionPreview(
  packages: PackageJson[],
  type: 'patch' | 'minor' | 'major'
): string {
  return packages
    .map(
      (pkg) =>
        `${pkg.name}: v${pkg.version} → v${getNextVersion(pkg.version, type)}`
    )
    .join('\n      ');
}

/**
 * Execute command and print output
 */
function exec(cmd: string, options?: { silent?: boolean }): string {
  if (!options?.silent) {
    console.log(`\n$ ${cmd}`);
  }
  try {
    const output = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: options?.silent ? 'pipe' : 'inherit',
    });
    return output || '';
  } catch (error) {
    throw error;
  }
}

/**
 * Main release flow
 */
async function main(): Promise<void> {
  console.log('\n🚀 Claude Skills 发布工具\n');
  console.log('='.repeat(50));

  // Show git tags info
  const tagsInfo = getGitTagsInfo();
  console.log('\n🏷️  Git Tags 信息:\n');
  console.log(`   总计: ${tagsInfo.total} 个 tag`);
  if (tagsInfo.latest) {
    console.log(`   最新: ${tagsInfo.latest}`);
  }

  // Show current versions
  const packages = getPackageVersions();
  console.log('\n📦 当前版本:\n');
  packages.forEach((pkg) => {
    console.log(`   ${pkg.name}: v${pkg.version}`);
  });

  console.log('\n' + '='.repeat(50));

  // Select version type
  const choice = await select<VersionChoice | 'cancel'>({
    message: '选择版本类型:',
    choices: [
      ...VERSION_CHOICES.map((choice) => ({
        name: `${choice.label.padEnd(8)} - ${choice.description}`,
        value: choice,
        description: `\n      ${formatVersionPreview(packages, choice.type)}`,
      })),
      new Separator(),
      {
        name: '取消发布',
        value: 'cancel' as const,
        description: '\n      退出发布流程',
      },
    ],
    pageSize: 10,
  });

  // Handle cancel
  if (choice === 'cancel') {
    console.log('\n❌ 已取消发布\n');
    process.exit(0);
  }

  const selectedChoice = choice;

  // Preview changes
  console.log(`\n📝 版本变更预览 (${selectedChoice.label}):\n`);
  packages.forEach((pkg) => {
    const next = getNextVersion(pkg.version, selectedChoice.type);
    console.log(`   ${pkg.name}: v${pkg.version} → v${next}`);
  });

  // Confirm
  const shouldContinue = await confirm({
    message: '确认发布?',
    default: false,
  });

  if (!shouldContinue) {
    console.log('\n❌ 已取消发布\n');
    process.exit(0);
  }

  // Execute release
  console.log('\n🔄 开始发布流程...\n');
  console.log('='.repeat(50));

  // 1. Sync shared code
  console.log('\n📦 Step 1/5: 同步共享代码...');
  exec('pnpm sync');

  // 2. Bump versions
  console.log(`\n📦 Step 2/5: 更新版本号 (${selectedChoice.type})...`);
  exec(`pnpm version:${selectedChoice.type}`);

  // 3. Git commit
  console.log('\n📦 Step 3/5: Git 提交...');
  exec('git add -A');
  exec(`git commit -m "chore: bump versions (${selectedChoice.type})"`);

  // 4. Publish
  console.log('\n📦 Step 4/5: 发布到 npm...');
  exec('pnpm -r publish --access public --no-git-checks');

  // 5. Git push
  console.log('\n📦 Step 5/5: 推送到远程...');
  exec('git push');

  // Done
  console.log('\n' + '='.repeat(50));
  console.log('✅ 发布完成!\n');

  // Show new versions
  const newPackages = getPackageVersions();
  console.log('📦 新版本:\n');
  newPackages.forEach((pkg) => {
    console.log(`   ${pkg.name}: v${pkg.version}`);
  });
  console.log();
}

// Run
main().catch((error) => {
  console.error('\n❌ 发布失败:', error);
  process.exit(1);
});
