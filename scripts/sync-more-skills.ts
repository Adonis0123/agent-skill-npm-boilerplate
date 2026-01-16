#!/usr/bin/env npx tsx

/**
 * Sync "更多技能" section to all skill packages' README.md
 *
 * This script:
 * 1. Reads the template from templates/more-skills.md
 * 2. Finds all packages with README.md
 * 3. Replaces the "## 更多技能" section in each README
 * 4. Excludes the current package's own link
 *
 * Usage: pnpm sync:skills
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

interface SkillLink {
  packageName: string;
  line: string;
}

/**
 * Parse the template and extract skill links
 */
function parseTemplate(templateContent: string): SkillLink[] {
  const lines = templateContent.split('\n');
  const skills: SkillLink[] = [];

  for (const line of lines) {
    // Match lines like: - [@adonis0123/weekly-report](url) - description
    const match = line.match(/^- \[@adonis0123\/([^\]]+)\]/);
    if (match) {
      skills.push({
        packageName: match[1],
        line: line,
      });
    }
  }

  return skills;
}

/**
 * Generate "更多技能" section for a specific package
 */
function generateSection(skills: SkillLink[], excludePackage: string): string {
  const filteredSkills = skills.filter((s) => s.packageName !== excludePackage);
  return '## 更多技能\n\n' + filteredSkills.map((s) => s.line).join('\n') + '\n';
}

/**
 * Replace "更多技能" section in README content
 */
function replaceSection(readmeContent: string, newSection: string): string {
  // Pattern to match "## 更多技能" section until next "##" or "---" or end of file
  const sectionRegex = /## 更多技能[\s\S]*?(?=\n## |\n---|\n*$)/;

  if (sectionRegex.test(readmeContent)) {
    // Replace existing section
    return readmeContent.replace(sectionRegex, newSection);
  } else {
    // Append before "## License" if exists, otherwise at the end
    const licenseRegex = /\n## License/;
    if (licenseRegex.test(readmeContent)) {
      return readmeContent.replace(licenseRegex, `\n${newSection}\n\n## License`);
    }
    return readmeContent.trimEnd() + '\n\n' + newSection + '\n';
  }
}

/**
 * Main sync function
 */
async function syncMoreSkills(): Promise<void> {
  console.log('🔄 Syncing "更多技能" section to all packages...\n');

  // Read template
  const templatePath = path.join(ROOT_DIR, 'templates', 'more-skills.md');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template not found:', templatePath);
    process.exit(1);
  }

  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const skills = parseTemplate(templateContent);

  console.log(`Found ${skills.length} skills in template:`);
  skills.forEach((s) => console.log(`  • ${s.packageName}`));
  console.log();

  // Find all packages with README.md
  const packagesDir = path.join(ROOT_DIR, 'packages');
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true });

  let updatedCount = 0;

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const readmePath = path.join(packagesDir, dir.name, 'README.md');
    if (!fs.existsSync(readmePath)) {
      console.log(`⏭ ${dir.name}: No README.md, skipping`);
      continue;
    }

    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const newSection = generateSection(skills, dir.name);
    const updatedContent = replaceSection(readmeContent, newSection);

    if (updatedContent !== readmeContent) {
      fs.writeFileSync(readmePath, updatedContent);
      console.log(`✅ ${dir.name}: Updated`);
      updatedCount++;
    } else {
      console.log(`✓ ${dir.name}: No changes needed`);
    }
  }

  console.log();
  console.log('='.repeat(50));
  console.log(`✅ Sync complete! Updated ${updatedCount} README files.`);
  console.log('='.repeat(50));
}

// Run
syncMoreSkills().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
