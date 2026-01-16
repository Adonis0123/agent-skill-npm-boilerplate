#!/usr/bin/env npx tsx

/**
 * 选择单个包发布
 *
 * Usage: pnpm publish:select
 */

import { select, confirm } from '@inquirer/prompts'
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
  currentVersion: string
}

/**
 * Get all publishable packages from packages directory
 */
function getPackages(): Package[] {
  const packagesDir = path.join(ROOT_DIR, 'packages')
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true })

  return dirs
    .filter((dir) => dir.isDirectory())
    .map((dir) => {
      const pkgPath = path.join(packagesDir, dir.name)
      const pkgJsonPath = path.join(pkgPath, 'package.json')

      if (!fs.existsSync(pkgJsonPath)) {
        return null
      }

      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
        if (pkgJson.private) {
          return null
        }
        return {
          name: pkgJson.name,
          dirName: dir.name,
          path: pkgPath,
          currentVersion: pkgJson.version,
        }
      } catch {
        return null
      }
    })
    .filter((pkg): pkg is Package => pkg !== null)
}

/**
 * Calculate next version based on bump type
 */
function getNextVersion(currentVersion: string, bump: 'patch' | 'minor' | 'major'): string {
  const [major, minor, patch] = currentVersion.split('.').map(Number)

  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}

/**
 * Execute command with inherited stdio
 */
function exec(cmd: string, options?: { cwd?: string }): void {
  execSync(cmd, { stdio: 'inherit', ...options })
}

async function main(): Promise<void> {
  console.log('\n📦 选择单个包发布\n')
  console.log('='.repeat(50))

  // 1. Get all packages
  const packages = getPackages()

  if (packages.length === 0) {
    console.log('❌ 没有找到可发布的包')
    process.exit(1)
  }

  // 2. Let user select a package
  const selectedPkg = await select({
    message: '选择要发布的包:',
    choices: packages.map((pkg) => ({
      name: `${pkg.name} (v${pkg.currentVersion})`,
      value: pkg,
    })),
  })

  // 3. Select version bump
  const bump = await select({
    message: `选择版本类型 (当前: ${selectedPkg.currentVersion}):`,
    choices: [
      {
        name: `patch → ${getNextVersion(selectedPkg.currentVersion, 'patch')}`,
        value: 'patch' as const,
      },
      {
        name: `minor → ${getNextVersion(selectedPkg.currentVersion, 'minor')}`,
        value: 'minor' as const,
      },
      {
        name: `major → ${getNextVersion(selectedPkg.currentVersion, 'major')}`,
        value: 'major' as const,
      },
    ],
  })

  const nextVersion = getNextVersion(selectedPkg.currentVersion, bump)

  // 4. Confirm
  console.log('\n' + '='.repeat(50))
  console.log(`📋 将发布: ${selectedPkg.name}`)
  console.log(`   版本: ${selectedPkg.currentVersion} → ${nextVersion}`)
  console.log('='.repeat(50) + '\n')

  const confirmed = await confirm({ message: '确认发布?' })
  if (!confirmed) {
    console.log('\n已取消发布。')
    process.exit(0)
  }

  // 5. Update version
  console.log('\n🔄 更新版本号...')
  exec(`npm version ${bump} --no-git-tag-version`, { cwd: selectedPkg.path })
  console.log(`  ✓ ${selectedPkg.name} → ${nextVersion}`)

  // 6. Git commit
  console.log('\n📝 提交更改...')
  const commitMessage = `chore: release ${selectedPkg.dirName}@${nextVersion}`
  exec('git add -A')
  exec(`git commit -m "${commitMessage}"`)

  // 7. Push
  console.log('\n📤 推送到远程仓库...')
  exec('git push')
  console.log('  ✓ 已推送')

  // 8. Publish to npm
  console.log('\n🚀 发布到 npm...')
  console.log('  提示: 如需免 OTP，请配置 ~/.npmrc 添加 Automation Token\n')

  try {
    exec(`npm publish --access public`, { cwd: selectedPkg.path })
    console.log(`  ✓ ${selectedPkg.name} 发布成功\n`)
  } catch (error) {
    console.error(`  ❌ ${selectedPkg.name} 发布失败`)
    throw error
  }

  // 9. Done
  console.log('\n' + '='.repeat(50))
  console.log(`✅ ${selectedPkg.name}@${nextVersion} 发布完成!`)
  console.log('='.repeat(50) + '\n')
}

// Run
main().catch((error) => {
  console.error('\n❌ 发布失败:', error.message)
  process.exit(1)
})
