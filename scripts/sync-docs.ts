#!/usr/bin/env npx tsx

/**
 * Sync package information to documentation files
 *
 * This script:
 * 1. Scans all packages in packages/ directory
 * 2. Extracts package name and description from package.json
 * 3. Updates README.md, README.en.md, CLAUDE.md with package lists
 * 4. Updates project structure in all documentation files
 *
 * Usage: pnpm sync:docs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

interface PackageInfo {
  name: string; // npm package name like @adonis0123/weekly-report
  dirName: string; // directory name like weekly-report
  description: string;
  isPrivate: boolean;
}

/**
 * Find all packages in packages/ directory
 */
function findAllPackages(): PackageInfo[] {
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
      const pkgJsonPath = path.join(pkgDir, 'package.json');

      if (!fs.existsSync(pkgJsonPath)) {
        return null;
      }

      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        return {
          name: pkgJson.name,
          dirName: dir.name,
          description: pkgJson.description || '',
          isPrivate: pkgJson.private === true,
        };
      } catch (error) {
        console.warn(`⚠ Could not parse ${pkgJsonPath}, skipping`);
        return null;
      }
    })
    .filter((pkg): pkg is PackageInfo => pkg !== null);
}

/**
 * Extract short description from full description
 */
function extractShortDescription(desc: string): string {
  // Remove "Claude Code Skill - " or "Claude Code 技能 - " prefix
  return desc
    .replace(/^Claude Code Skill\s*-\s*/i, '')
    .replace(/^Claude Code 技能\s*-\s*/, '')
    .trim();
}

/**
 * Generate one-line install command (Chinese)
 */
function generateOneLineInstallCN(packages: PackageInfo[]): string {
  const publicPackages = packages.filter((p) => !p.isPrivate);
  return `npm i -g ${publicPackages.map((p) => p.name).join(' ')}`;
}

/**
 * Generate multi-line install command (Chinese)
 */
function generateMultiLineInstallCN(packages: PackageInfo[]): string {
  const publicPackages = packages.filter((p) => !p.isPrivate);
  return publicPackages.map((p, i) => `npm i -g ${p.name}${i < publicPackages.length - 1 ? ' && \\' : ''}`).join('\n');
}

/**
 * Generate package table (Chinese)
 */
function generatePackageTableCN(packages: PackageInfo[]): string {
  const lines = [
    '| 包名 | 描述 | 安装命令 |',
    '|------|------|----------|',
  ];

  packages.forEach((pkg) => {
    const shortDesc = extractShortDescription(pkg.description);
    const installCmd = pkg.isPrivate ? '-' : `\`npm i -g ${pkg.name}\``;
    lines.push(`| [${pkg.name}](./packages/${pkg.dirName}) | ${shortDesc} | ${installCmd} |`);
  });

  return lines.join('\n');
}

/**
 * Generate package table (English)
 */
function generatePackageTableEN(packages: PackageInfo[]): string {
  const lines = [
    '| Package | Description | Installation |',
    '|---------|-------------|--------------|',
  ];

  packages.forEach((pkg) => {
    const shortDesc = extractShortDescription(pkg.description);
    const installCmd = pkg.isPrivate ? '-' : `\`npm i -g ${pkg.name}\``;
    lines.push(`| [${pkg.name}](./packages/${pkg.dirName}) | ${shortDesc} | ${installCmd} |`);
  });

  return lines.join('\n');
}

/**
 * Generate project structure tree
 */
function generateProjectStructure(packages: PackageInfo[]): string {
  const lines = [
    'claude-skills/',
    '├── package.json              # 根配置（private: true）',
    '├── pnpm-workspace.yaml       # workspace 配置',
    '└── packages/',
  ];

  packages.forEach((pkg, i) => {
    const isLast = i === packages.length - 1;
    const prefix = isLast ? '    └──' : '    ├──';
    const shortDesc = extractShortDescription(pkg.description);
    // Shorten description for structure view
    const structDesc = shortDesc.length > 30 ? shortDesc.substring(0, 30) + '...' : shortDesc;
    lines.push(`${prefix} ${pkg.dirName}/${' '.repeat(Math.max(0, 24 - pkg.dirName.length))}# ${structDesc}`);
  });

  return lines.join('\n');
}

/**
 * Generate CLAUDE.md package list
 */
function generateClaudeMdPackageList(packages: PackageInfo[]): string {
  return packages.map((pkg) => {
    const shortDesc = extractShortDescription(pkg.description);
    return `- \`${pkg.name}\` - ${shortDesc}`;
  }).join('\n');
}

/**
 * Update README.md
 */
function updateReadmeCN(packages: PackageInfo[]): void {
  const filePath = path.join(ROOT_DIR, 'README.md');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update one-line install command (in "一键安装所有包" section only)
  const oneLineInstall = generateOneLineInstallCN(packages);
  content = content.replace(
    /(# 复制下面的命令,一次性安装所有技能包\n)npm i -g @adonis0123\/[^\n]+/,
    `$1${oneLineInstall}`
  );

  // Update multi-line install command
  const multiLineInstall = generateMultiLineInstallCN(packages);
  content = content.replace(
    /(或者分行安装（更清晰）：\n\n```bash\n)npm i -g @adonis0123\/[\s\S]*?(?=\n```)/,
    `$1${multiLineInstall}\n`
  );

  // Update package table
  const packageTable = generatePackageTableCN(packages);
  content = content.replace(
    /\| 包名 \| 描述 \| 安装命令 \|[\s\S]*?(?=\n\n|\n>)/,
    packageTable
  );

  // Update project structure
  const projectStructure = generateProjectStructure(packages);
  content = content.replace(
    /claude-skills\/\n├── package\.json[\s\S]*?└── packages\/[\s\S]*?(?=\n```)/,
    projectStructure
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Updated README.md');
}

/**
 * Update README.en.md
 */
function updateReadmeEN(packages: PackageInfo[]): void {
  const filePath = path.join(ROOT_DIR, 'README.en.md');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update one-line install command (in "Install All Packages at Once" section only)
  const oneLineInstall = generateOneLineInstallCN(packages); // Same command works for EN
  content = content.replace(
    /(# Copy this command to install all skill packages at once\n)npm i -g @adonis0123\/[^\n]+/,
    `$1${oneLineInstall}`
  );

  // Update multi-line install command
  const multiLineInstall = generateMultiLineInstallCN(packages);
  content = content.replace(
    /(Or install line by line \(clearer\):\n\n```bash\n)npm i -g @adonis0123\/[\s\S]*?(?=\n```)/,
    `$1${multiLineInstall}\n`
  );

  // Update package table
  const packageTable = generatePackageTableEN(packages);
  content = content.replace(
    /\| Package \| Description \| Installation \|[\s\S]*?(?=\n\n|\n>)/,
    packageTable
  );

  // Update project structure in English version
  const projectStructure = generateProjectStructure(packages);
  // The structure is the same, just replace
  content = content.replace(
    /agent-skill-npm-boilerplate\/\n├── package\.json[\s\S]*?└── packages\/[\s\S]*?(?=\n```)/,
    projectStructure.replace('claude-skills/', 'agent-skill-npm-boilerplate/')
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Updated README.en.md');
}

/**
 * Update CLAUDE.md
 */
function updateClaudeMd(packages: PackageInfo[]): void {
  const filePath = path.join(ROOT_DIR, 'CLAUDE.md');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update package list
  const packageList = generateClaudeMdPackageList(packages);
  content = content.replace(
    /- `@adonis0123\/.*?(?=\n\n## 项目结构)/s,
    packageList + '\n'
  );

  // Update project structure
  const projectStructure = generateProjectStructure(packages);
  content = content.replace(
    /claude-skills\/\n├── package\.json[\s\S]*?└── packages\/[\s\S]*?(?=\n```)/,
    projectStructure
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Updated CLAUDE.md');
}

/**
 * Update packages/create-skill/SKILL.md
 */
function updateCreateSkillMd(packages: PackageInfo[]): void {
  const filePath = path.join(ROOT_DIR, 'packages', 'create-skill', 'SKILL.md');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Update example project structure (simplified version showing only a few packages)
  const structureExample = `claude-skills/
├── packages/
│   ├── weekly-report/        # Local mode skill
│   ├── agent-browser/        # Local mode skill
│   ├── react-best-practices/ # Remote mode skill
│   ├── skill-development/    # Remote mode skill
│   └── css-tailwind-styling/ # CSS/Tailwind styling guide
├── shared/src/               # Shared install/uninstall scripts
└── scripts/                  # Sync and publish utilities`;

  content = content.replace(
    /claude-skills\/\n├── packages\/[\s\S]*?└── scripts\/.*?(?=\n```)/,
    structureExample
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Updated packages/create-skill/SKILL.md');
}

/**
 * Main function
 */
function main(): void {
  console.log('🔄 Syncing documentation files...\n');

  const allPackages = findAllPackages();

  if (allPackages.length === 0) {
    console.warn('⚠ No packages found');
    return;
  }

  console.log('Found packages:');
  allPackages.forEach((pkg) => {
    const label = pkg.isPrivate ? '(private)' : '(public)';
    console.log(`  • ${pkg.name} ${label}`);
  });
  console.log();

  // Update all documentation files
  updateReadmeCN(allPackages);
  updateReadmeEN(allPackages);
  updateClaudeMd(allPackages);
  updateCreateSkillMd(allPackages);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Documentation sync complete!');
  console.log('='.repeat(50));
}

// Run
main();
