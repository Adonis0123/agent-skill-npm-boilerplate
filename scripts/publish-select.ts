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

/**
 * Get the latest version from npm registry
 */
function getNpmLatestVersion(packageName: string): string | null {
  try {
    const result = execSync(`npm view ${packageName} versions --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const versions = JSON.parse(result) as string[]
    if (versions.length === 0) return null
    // Sort versions and get the highest one
    return versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
      if (aMajor !== bMajor) return aMajor - bMajor
      if (aMinor !== bMinor) return aMinor - bMinor
      return aPatch - bPatch
    }).pop()!
  } catch {
    // Package not found on npm
    return null
  }
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

  // 3. Check npm latest version
  console.log(`\n🔍 检查 npm 上的版本...`)
  const npmLatestVersion = getNpmLatestVersion(selectedPkg.name)
  const baseVersion = npmLatestVersion || selectedPkg.currentVersion

  if (npmLatestVersion) {
    console.log(`   npm 最新版本: ${npmLatestVersion}`)
    console.log(`   本地版本: ${selectedPkg.currentVersion}`)
    if (npmLatestVersion !== selectedPkg.currentVersion) {
      console.log(`   ⚠️  版本不一致，将基于 npm 版本 (${npmLatestVersion}) 计算新版本`)
    }
  } else {
    console.log(`   这是一个新包，将基于本地版本 (${selectedPkg.currentVersion})`)
  }

  // 4. Select version bump (based on npm version if available)
  const bump = await select({
    message: `选择版本类型 (基于: ${baseVersion}):`,
    choices: [
      {
        name: `patch → ${getNextVersion(baseVersion, 'patch')}`,
        value: 'patch' as const,
      },
      {
        name: `minor → ${getNextVersion(baseVersion, 'minor')}`,
        value: 'minor' as const,
      },
      {
        name: `major → ${getNextVersion(baseVersion, 'major')}`,
        value: 'major' as const,
      },
    ],
  })

  const nextVersion = getNextVersion(baseVersion, bump)

  // 5. Confirm
  console.log('\n' + '='.repeat(50))
  console.log(`📋 将发布: ${selectedPkg.name}`)
  console.log(`   版本: ${selectedPkg.currentVersion} → ${nextVersion}`)
  console.log('='.repeat(50) + '\n')

  const confirmed = await confirm({ message: '确认发布?' })
  if (!confirmed) {
    console.log('\n已取消发布。')
    process.exit(0)
  }

  // 6. Update version (set exact version, not bump)
  console.log('\n🔄 更新版本号...')
  if (selectedPkg.currentVersion === nextVersion) {
    console.log(`  ✓ 本地版本已是 ${nextVersion}，跳过版本更新`)
  } else {
    exec(`npm version ${nextVersion} --no-git-tag-version`, { cwd: selectedPkg.path })
    console.log(`  ✓ ${selectedPkg.name} → ${nextVersion}`)
  }

  // 7. Git commit (only if there are changes)
  let hasCommit = false
  let hasPushed = false
  if (selectedPkg.currentVersion !== nextVersion) {
    console.log('\n📝 提交更改...')
    const commitMessage = `chore: release ${selectedPkg.dirName}@${nextVersion}`
    exec('git add -A')
    exec(`git commit -m "${commitMessage}"`)
    hasCommit = true

    // 8. Push
    console.log('\n📤 推送到远程仓库...')
    try {
      exec('git push')
      console.log('  ✓ 已推送')
      hasPushed = true
    } catch (error) {
      console.error('  ❌ 推送失败')
      console.log('\n🔄 正在回滚本地提交...')
      try {
        exec('git reset --hard HEAD~1')
        console.log('  ✓ 已回滚本地 commit')
      } catch {
        console.error('  ⚠️  回滚失败，请手动执行: git reset --hard HEAD~1')
      }
      throw error
    }
  } else {
    console.log('\n📝 无版本变更，跳过 git 提交')
  }

  // 9. Publish to npm
  console.log('\n🚀 发布到 npm...')
  console.log('  提示: 如需免 OTP，请配置 ~/.npmrc 添加 Automation Token\n')

  try {
    exec(`npm publish --access public`, { cwd: selectedPkg.path })
    console.log(`  ✓ ${selectedPkg.name} 发布成功\n`)
  } catch (error) {
    console.error(`  ❌ ${selectedPkg.name} 发布失败`)

    // 10. Rollback on failure (only if we made a commit)
    if (hasCommit) {
      console.log('\n🔄 正在回滚更改...')
      try {
        exec('git reset --hard HEAD~1')
        console.log('  ✓ 已回滚 git commit')
        if (hasPushed) {
          exec('git push --force')
          console.log('  ✓ 已同步远程仓库')
        }
        console.log('\n✅ 回滚完成，版本号已恢复')
      } catch (rollbackError) {
        console.error('\n⚠️  自动回滚失败，请手动执行:')
        console.error('   git reset --hard HEAD~1')
        if (hasPushed) {
          console.error('   git push --force')
        }
      }
    }

    throw error
  }

  // 11. Done
  console.log('\n' + '='.repeat(50))
  console.log(`✅ ${selectedPkg.name}@${nextVersion} 发布完成!`)
  console.log('='.repeat(50) + '\n')
}

// Run
main().catch((error) => {
  console.error('\n❌ 发布失败:', error.message)
  process.exit(1)
})
