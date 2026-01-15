# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **template repository** for creating npm-distributable AI coding agent skills. It enables packaging Claude Code skills (and other AI tool skills) as npm packages for easy installation, versioning, and distribution.

## Commands

```bash
# Test installation (runs install-skill.js and installs to ~/.claude/skills/)
npm test

# Manual installation test
node install-skill.js

# Test uninstallation
node uninstall-skill.js

# Verify installed skill
ls -la ~/.claude/skills/your-skill-name/
cat ~/.claude/skills/your-skill-name/SKILL.md
```

## Architecture

### Core Files

- **`install-skill.js`** - npm postinstall hook that copies skill files to target directories (e.g., `~/.claude/skills/`)
- **`uninstall-skill.js`** - npm preuninstall hook that removes skill files from target directories
- **`utils.js`** - Shared utilities: `getEnabledTargets()`, `extractSkillName()`, `detectInstallLocation()`
- **`.claude-skill.json`** - Configuration defining skill name, files to copy, hooks, and target AI tools

### Installation Flow

1. User runs `npm install -g @org/skill-name`
2. npm triggers `postinstall` hook → `install-skill.js`
3. Script reads `.claude-skill.json` to get enabled targets and files
4. Detects global vs project install via `process.env.npm_config_global`
5. Copies `SKILL.md` and configured files to each target's skills directory
6. Updates `.skills-manifest.json` in the skills directory

### Multi-Tool Support

Configured in `.claude-skill.json` under `targets`. Each target has:
- `enabled`: boolean to include/exclude
- `paths.global`: path relative to home directory for global installs
- `paths.project`: path relative to project root for local installs

Default targets: Claude Code (enabled), Cursor, Windsurf, Aider (disabled).

### Key Functions (utils.js)

- `extractSkillName(packageName)` - Strips npm scope prefix (e.g., `@org/skill` → `skill`)
- `detectInstallLocation(targetPaths, isGlobal)` - Resolves installation directory, handles project root detection for local installs
- `getEnabledTargets(config)` - Returns array of enabled target configurations

## Creating a Skill

1. Update `package.json`: name, description, author, repository
2. Update `.claude-skill.json`: skill name, package name, enabled targets
3. Edit `SKILL.md`: frontmatter (name, description, allowed-tools) and instructions
4. Add supporting files to `files` in `.claude-skill.json` if needed
5. Test with `npm test`
6. Publish with `npm publish --access public`

## Conventions

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.
- SKILL.md should stay under 500 lines; use `reference.md` and `examples.md` for detailed content
- Skill names in `.claude-skill.json` must match the `name` field in SKILL.md frontmatter
