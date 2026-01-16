#!/usr/bin/env npx tsx

/**
 * 选择单个包本地安装
 *
 * Usage: pnpm install:select
 */

import { select } from '@inquirer/prompts'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.dirname(__dirname)

interface Package {
  name: string
  dirName: string
  path: string
  description: string
}

/**
 * Get all installable packages from packages directory
 */
function getPackages(): Package[] {
  const packagesDir = path.join(ROOT_DIR, 'packages')
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true })

  return dirs
    .filter((dir) => dir.isDirectory())
    .map((dir) => {
      const pkgPath = path.join(packagesDir, dir.name)
      const installScript = path.join(pkgPath, 'install-skill.js')

      if (!fs.existsSync(installScript)) {
        return null
      }

      // Try to get description from package.json
      let description = ''
      const pkgJsonPath = path.join(pkgPath, 'package.json')
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
          description = pkgJson.description || ''
        } catch {
          // ignore
        }
      }

      return {
        name: dir.name,
        dirName: dir.name,
        path: pkgPath,
        description,
      }
    })
    .filter((pkg): pkg is Package => pkg !== null)
}

/**
 * Execute command with inherited stdio
 */
function exec(cmd: string, options?: { cwd?: string }): void {
  execSync(cmd, { stdio: 'inherit', ...options })
}

async function main(): Promise<void> {
  console.log('\n📦 选择技能包本地安装\n')
  console.log('='.repeat(50))

  // 1. Get all packages
  const packages = getPackages()

  if (packages.length === 0) {
    console.log('❌ 没有找到可安装的包')
    process.exit(1)
  }

  // 2. Let user select a package
  const selectedPkg = await select({
    message: '选择要安装的技能包:',
    choices: packages.map((pkg) => ({
      name: pkg.description ? `${pkg.name} - ${pkg.description}` : pkg.name,
      value: pkg,
    })),
  })

  // 3. Run install script
  console.log(`\n🚀 正在安装 ${selectedPkg.name}...\n`)
  exec('node install-skill.js', { cwd: selectedPkg.path })

  // 4. Done
  console.log('\n' + '='.repeat(50))
  console.log(`✅ ${selectedPkg.name} 安装完成!`)
  console.log('='.repeat(50) + '\n')
}

// Run
main().catch((error) => {
  console.error('\n❌ 安装失败:', error.message)
  process.exit(1)
})
