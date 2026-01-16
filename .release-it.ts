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
    // Note: publish is handled separately via `pnpm publish` (interactive, supports OTP)
  },
  plugins: {
    'release-it-pnpm': {
      root: true,
      packageManager: 'pnpm',
    },
  },
} satisfies Config
