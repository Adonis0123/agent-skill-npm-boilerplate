import type { Config } from 'release-it'

export default {
  git: {
    commitMessage: 'chore: release ${version}',
    tagName: 'v${version}',
  },
  npm: {
    publish: false,
  },
  plugins: {
    'release-it-pnpm': {
      root: true,
      packageManager: 'pnpm',
    },
  },
} satisfies Config
