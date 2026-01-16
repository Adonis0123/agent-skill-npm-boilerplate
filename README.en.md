[简体中文](./README.md) | English

---

# Agent Skills

> AI Agent Skill Management Toolkit - Includes CLI tool and multiple installable skill packages

## 🚀 Quick Start

### Initialize After Cloning

```bash
git clone https://github.com/Adonis0123/agent-skill-npm-boilerplate.git
cd agent-skill-npm-boilerplate
pnpm setup
```

`pnpm setup` will automatically install dependencies, sync scripts, and install the `create-skill` skill to the project.

### Method 1: Using CLI Tool (Recommended)

```bash
# Install CLI
npm i -g @adonis0123/skill-cli

# Install a skill
skill install anthropics/skills/skills/pdf

# List installed skills
skill list

# Update all skills
skill update
```

### Method 2: Direct Package Installation

```bash
# Install a single skill
npm i -g @adonis0123/weekly-report

# Automatically deployed to ~/.claude/skills/ after installation
```

#### Install All Packages at Once

```bash
# Copy this command to install all skill packages at once
npm i -g @adonis0123/skill-cli @adonis0123/weekly-report @adonis0123/agent-browser @adonis0123/react-best-practices @adonis0123/skill-development @adonis0123/commit @adonis0123/staged-changes-review @adonis0123/code-doc-generator
```

Or install line by line (clearer):

```bash
npm i -g @adonis0123/skill-cli && \
npm i -g @adonis0123/weekly-report && \
npm i -g @adonis0123/agent-browser && \
npm i -g @adonis0123/react-best-practices && \
npm i -g @adonis0123/skill-development && \
npm i -g @adonis0123/commit && \
npm i -g @adonis0123/staged-changes-review && \
npm i -g @adonis0123/code-doc-generator
```

---

## 📦 Included Packages

| Package | Description | Installation |
|---------|-------------|--------------|
| [@adonis0123/skill-cli](./packages/cli) | CLI tool for managing AI Agent skills | `npm i -g @adonis0123/skill-cli` |
| [@adonis0123/weekly-report](./packages/weekly-report) | Auto-generate weekly reports from Git commits | `npm i -g @adonis0123/weekly-report` |
| [@adonis0123/agent-browser](./packages/agent-browser) | Browser automation (testing, screenshots, data extraction) | `npm i -g @adonis0123/agent-browser` |
| [@adonis0123/react-best-practices](./packages/react-best-practices) | React/Next.js performance optimization best practices | `npm i -g @adonis0123/react-best-practices` |
| [@adonis0123/skill-development](./packages/skill-development) | Official Claude Code skill development guide | `npm i -g @adonis0123/skill-development` |
| [@adonis0123/commit](./packages/commit) | Auto-generate Conventional Commits messages | `npm i -g @adonis0123/commit` |
| [@adonis0123/staged-changes-review](./packages/staged-changes-review) | Staged changes review (risk assessment, error detection) | `npm i -g @adonis0123/staged-changes-review` |
| [@adonis0123/code-doc-generator](./packages/code-doc-generator) | Auto-generate README docs with Mermaid diagrams | `npm i -g @adonis0123/code-doc-generator` |

> **Note**: `@adonis0123/create-skill` is a private package, not published to npm, for internal project use only.

---

## 🛠️ CLI Tool Usage

### Install Skills

```bash
# From GitHub (degit shorthand)
skill install anthropics/skills/skills/pdf

# From full GitHub URL
skill install https://github.com/anthropics/skills/tree/main/skills/pdf

# From local directory
skill install ./my-skill

# Install to specific platform
skill install anthropics/skills/skills/pdf -t cursor

# Install to all platforms
skill install anthropics/skills/skills/pdf --all

# Force reinstall
skill install anthropics/skills/skills/pdf --force

# Install to project-level directory (not global)
skill install anthropics/skills/skills/pdf --local
```

### Manage Skills

```bash
# List all installed skills
skill list

# Show installation paths
skill list --paths

# View skill details
skill info pdf

# Update specific skill
skill update pdf

# Update all skills
skill update

# Uninstall skill
skill uninstall pdf
```

### Multi-Platform Support

| Platform | Argument | Global Directory | Project Directory |
|----------|----------|------------------|-------------------|
| Claude Code | `-t claude` (default) | `~/.claude/skills` | `.claude/skills` |
| Cursor | `-t cursor` | `~/.cursor/skills` | `.cursor/skills` |
| Codex | `-t codex` | `~/.codex/skills` | `.codex/skills` |
| GitHub Copilot | `-t copilot` | `~/.copilot/skills` | `.copilot/skills` |

```bash
# Install to Cursor
skill install anthropics/skills/skills/pdf -t cursor

# Install to all platforms
skill install anthropics/skills/skills/pdf --all

# List Cursor's skills
skill list -t cursor
```

### All Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `skill install <source>` | `i` | Install skill from Git URL, degit shorthand, or local directory |
| `skill list` | `ls` | List installed skills |
| `skill info <skill>` | - | Show skill details |
| `skill update [skill]` | `up` | Update one or all skills |
| `skill uninstall <skill>` | `rm` | Uninstall skill |

---

## 📚 Skill Details

### weekly-report

Automatically reads Git commit history and generates structured weekly reports grouped by project.

- Supports multi-repository aggregation
- Smart filtering of trivial commits (typo, merge, format)
- Flexible time ranges (this week, last week, custom)

```bash
npm i -g @adonis0123/weekly-report
```

Use in Claude Code: `/weekly-report`

### agent-browser

Browser automation tool based on Playwright.

- Web navigation and interaction
- Form filling
- Screenshots
- Data extraction

```bash
npm i -g @adonis0123/agent-browser
```

Use in Claude Code: `/agent-browser`

### react-best-practices

React/Next.js performance optimization guide from Vercel Engineering.

- 45 optimization rules across 8 priority categories
- Detailed code examples
- **Automatically pulls latest version from upstream repository on install**

```bash
npm i -g @adonis0123/react-best-practices
```

Use in Claude Code: `/react-best-practices`

### skill-development

Official Claude Code skill development guide from Anthropic.

- Skill structure and design principles (Progressive Disclosure)
- Complete workflow for creating skills (6 steps)
- Best practices and validation checklist
- **Automatically pulls latest version from upstream repository on install**

```bash
npm i -g @adonis0123/skill-development
```

Use in Claude Code: `/skill-development`

### commit

Automatically generates Git commit messages following Conventional Commits specification.

- Analyzes staged code changes
- Auto-selects appropriate type and emoji prefix
- Supports both Chinese and English commit messages

```bash
npm i -g @adonis0123/commit
```

Use in Claude Code: `/commit`

### staged-changes-review

Comprehensive review tool for staged changes.

- Risk assessment and error detection
- Impact analysis
- Pre-commit validation suggestions

```bash
npm i -g @adonis0123/staged-changes-review
```

Use in Claude Code: `/staged-changes-review`

### code-doc-generator

Automatically analyzes code repositories and generates README documentation.

- Architecture and flow diagrams (Mermaid)
- Feature descriptions and code flow visualizations
- Supports multiple programming languages

```bash
npm i -g @adonis0123/code-doc-generator
```

Use in Claude Code: `/code-doc-generator`

### create-skill (Private)

Project-specific skill creation tool for quickly creating new skill packages.

- 6-step creation workflow guide
- Complete configuration file templates
- Detailed validation checklist

> This package is not published to npm. Run `pnpm setup` after cloning to auto-install.

Use in Claude Code: `/create-skill`

---

## 🔧 Developer Guide

### Project Structure

```
agent-skill-npm-boilerplate/
├── package.json              # Root config (private: true)
├── pnpm-workspace.yaml       # Workspace config
├── shared/                   # Shared source code (TypeScript)
│   └── src/
│       ├── types.ts          # Type definitions
│       ├── utils.ts          # Utility functions
│       ├── install-skill.ts  # Install script
│       └── uninstall-skill.ts# Uninstall script
├── scripts/
│   └── sync-shared.ts        # Sync script (esbuild bundling)
└── packages/
    ├── cli/                  # CLI tool
    │   ├── src/
    │   │   ├── index.ts      # Main entry
    │   │   ├── types.ts      # Type definitions
    │   │   ├── utils.ts      # Utility functions
    │   │   └── commands/     # Command implementations
    │   └── package.json
    ├── weekly-report/        # Weekly report skill
    ├── agent-browser/        # Browser automation skill
    ├── react-best-practices/ # React best practices skill
    ├── skill-development/    # Skill development guide (remote sync)
    └── create-skill/         # Skill creation tool (private)
```

### Shared Code Architecture

Install/uninstall scripts for skill packages are written in TypeScript and synced to each package after bundling with esbuild:

```
shared/src/*.ts  →  esbuild bundling  →  packages/*/install-skill.js
                                      →  packages/*/uninstall-skill.js
```

**Features:**
- **Strong typing**: All code written in TypeScript
- **Auto-detection mode**: Automatically selects local or remote mode based on `remoteSource` field in `.claude-skill.json`
- **Single-file bundling**: Each package's scripts are independent single files, no need to handle module paths

### Common Commands

```bash
# Initialize after cloning (install deps + sync scripts + install create-skill)
pnpm setup

# Install dependencies
pnpm install

# Sync shared code to packages (run after modifying shared/)
pnpm sync

# Build CLI
cd packages/cli && pnpm build

# Test all packages
pnpm test:all

# Publish all packages (automatically runs sync)
pnpm publish:all

# Publish individual package
pnpm release:weekly-report
pnpm release:agent-browser
pnpm release:react-best-practices
```

### Adding New Skills

Recommended: Use the `create-skill` skill to create new skill packages:

```bash
# Ensure you've run pnpm setup
# In Claude Code say "create a new skill package" or "/create-skill"
```

Or manually:

1. Create `packages/new-skill/` directory
2. Create necessary files:
   - `.claude-skill.json` - Skill configuration
   - `SKILL.md` - Skill definition (core)
   - `package.json` - npm package config
3. Run `pnpm sync` to auto-generate install scripts
4. Test: `npm test`
5. Publish: `npm publish --access public`

### Skill Package Structure

```
packages/skill-name/
├── package.json          # npm package config
├── .claude-skill.json    # Skill installation config
├── SKILL.md              # Skill definition (core)
├── install-skill.js      # ← Auto-generated (pnpm sync)
├── uninstall-skill.js    # ← Auto-generated (pnpm sync)
└── README.md             # Documentation
```

### .claude-skill.json Configuration

```jsonc
{
  "name": "skill-name",           // Skill name
  "version": "1.0.0",             // Version
  "package": "@scope/skill-name", // npm package name
  "remoteSource": "owner/repo/path", // Optional: remote source (enables remote mode if present)
  "files": {                      // Optional: additional file mappings
    "src": "src/",
    "config.json": "config.json"
  },
  "targets": {                    // Installation target platforms
    "claude-code": {
      "enabled": true,
      "paths": { "global": ".claude/skills", "project": ".claude/skills" }
    },
    "cursor": {
      "enabled": true,
      "paths": { "global": ".cursor/skills", "project": ".cursor/skills" }
    }
  }
}
```

### Publishing Workflow

```bash
# 1. Login to npm
npm login

# 2. Update version and publish individual package
pnpm release:weekly-report

# Or batch publish
pnpm version:patch  # Update all package versions
pnpm publish:all    # Publish all packages (automatically runs sync)
```

---

## 📄 License

MIT
