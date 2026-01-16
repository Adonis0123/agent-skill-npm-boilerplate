/* eslint-disable no-template-curly-in-string */
import type { Config } from 'release-it'

export default {
  git: {
    commitMessage: 'chore: release v${version}',
    tagName: 'v${version}',
    push: true,
  },
  npm: {
    publish: false, // Root package is private, don't publish
  },
  hooks: {
    // Bump all package versions before committing
    'before:bump': 'pnpm -r exec npm version ${version} --no-git-tag-version',
    // Note: npm publish removed from hooks due to OTP requirement
    // Use `pnpm publish` (interactive) or `pnpm publish:all` (manual) after tagging
  },
  plugins: {
    'release-it-pnpm': {
      root: true,
      packageManager: 'pnpm',
    },
  },
} satisfies Config
