#!/usr/bin/env npx tsx

/**
 * Interactive publish tool for monorepo packages
 *
 * This script:
 * 1. Lists all publishable packages with current versions
 * 2. Lets you choose version bump type for each package
 * 3. Updates versions, commits, and publishes with OTP support
 *
 * Usage: pnpm publish
 */

import { select, confirm, input } from '@inquirer/prompts'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.dirname(__dirname)

interface Package {
  name: string
  path: string
  currentVersion: string
}

interface PackageToPublish extends Package {
  bump: 'patch' | 'minor' | 'major'
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
        // Skip private packages
        if (pkgJson.private) {
          return null
        }
        return {
          name: pkgJson.name,
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

/**
 * Execute command and return output
 */
function execQuiet(cmd: string, options?: { cwd?: string }): string {
  return execSync(cmd, { encoding: 'utf-8', ...options }).trim()
}

async function main(): Promise<void> {
  console.log('\n📦 交互式发布工具\n')
  console.log('='.repeat(50))

  // 1. Get all packages
  const packages = getPackages()

  if (packages.length === 0) {
    console.log('❌ 没有找到可发布的包')
    process.exit(1)
  }

  // 2. Let user select version for each package
  const packagesToPublish: PackageToPublish[] = []

  for (const pkg of packages) {
    console.log(`\n${pkg.name} (当前版本: ${pkg.currentVersion})`)

    const action = await select({
      message: '选择操作:',
      choices: [
        { name: '跳过', value: 'skip' },
        {
          name: `patch → ${getNextVersion(pkg.currentVersion, 'patch')}`,
          value: 'patch',
        },
        {
          name: `minor → ${getNextVersion(pkg.currentVersion, 'minor')}`,
          value: 'minor',
        },
        {
          name: `major → ${getNextVersion(pkg.currentVersion, 'major')}`,
          value: 'major',
        },
      ],
    })

    if (action !== 'skip') {
      packagesToPublish.push({
        ...pkg,
        bump: action as 'patch' | 'minor' | 'major',
      })
    }
  }

  // 3. Check if any packages selected
  if (packagesToPublish.length === 0) {
    console.log('\n没有选择任何包发布，退出。')
    process.exit(0)
  }

  // 4. Show summary and confirm
  console.log('\n' + '='.repeat(50))
  console.log('📋 将发布以下包:\n')
  packagesToPublish.forEach((pkg) => {
    const nextVersion = getNextVersion(pkg.currentVersion, pkg.bump)
    console.log(`  • ${pkg.name}: ${pkg.currentVersion} → ${nextVersion} (${pkg.bump})`)
  })
  console.log()

  const confirmed = await confirm({ message: '确认发布?' })
  if (!confirmed) {
    console.log('\n已取消发布。')
    process.exit(0)
  }

  // 5. Update versions
  console.log('\n🔄 更新版本号...')
  for (const pkg of packagesToPublish) {
    exec(`npm version ${pkg.bump} --no-git-tag-version`, { cwd: pkg.path })
    const nextVersion = getNextVersion(pkg.currentVersion, pkg.bump)
    console.log(`  ✓ ${pkg.name} → ${nextVersion}`)
  }

  // 6. Git commit and push
  console.log('\n📝 提交更改...')
  const commitMessage = packagesToPublish
    .map((pkg) => `${pkg.name.replace('@adonis0123/', '')}@${getNextVersion(pkg.currentVersion, pkg.bump)}`)
    .join(', ')

  exec('git add -A')
  exec(`git commit -m "chore: release ${commitMessage}"`)
  exec('git push')
  console.log('  ✓ 已推送到远程仓库')

  // 7. Publish to npm with OTP
  console.log('\n🚀 发布到 npm...')
  const otp = await input({ message: '请输入 npm OTP:' })

  for (const pkg of packagesToPublish) {
    const nextVersion = getNextVersion(pkg.currentVersion, pkg.bump)
    console.log(`\n  发布 ${pkg.name}@${nextVersion}...`)
    try {
      exec(`npm publish --access public --otp=${otp}`, { cwd: pkg.path })
      console.log(`  ✓ ${pkg.name} 发布成功`)
    } catch (error) {
      console.error(`  ❌ ${pkg.name} 发布失败`)
      throw error
    }
  }

  // 8. Done
  console.log('\n' + '='.repeat(50))
  console.log('✅ 发布完成!')
  console.log('='.repeat(50) + '\n')
}

// Run
main().catch((error) => {
  console.error('\n❌ 发布失败:', error.message)
  process.exit(1)
})
