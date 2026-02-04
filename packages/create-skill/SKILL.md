---
name: create-skill
description: This skill should be used when the user asks to "create a new skill", "add a new skill package", "新建 skill 包", "创建新技能", "添加新的技能包", or wants to add a new npm skill package to this claude-skills monorepo project.
version: 1.0.0
---

# Create Skill Package

This skill provides a streamlined workflow for creating new npm skill packages in the claude-skills monorepo project.

## Project Overview

This is a monorepo managing multiple Claude Code skill npm packages:

```
claude-skills/
├── packages/
│   ├── weekly-report/        # Local mode skill
│   ├── agent-browser/        # Local mode skill
│   ├── react-best-practices/ # Remote mode skill
│   ├── skill-development/    # Remote mode skill
│   └── css-tailwind-styling/ # CSS/Tailwind styling guide
├── shared/src/               # Shared install/uninstall scripts
└── scripts/                  # Sync and publish utilities
```

**Two Skill Modes:**
- **Local Mode**: Content bundled in npm package
- **Remote Mode**: Fetches latest content from upstream repository on install

## Skill Creation Workflow

### Step 1: Create Directory Structure

Create the package directory with required subdirectories:

```bash
mkdir -p packages/{{SKILL_NAME}}/{references,src}
```

Determine which subdirectories are needed:
- `references/` - Documentation files loaded as needed
- `src/` - Source code or scripts
- `assets/` - Templates, images, or other static files

### Step 2: Create .claude-skill.json

Create the skill configuration file. Consult `references/templates.md` for complete templates.

**Local Mode** (bundled content):
```json
{
  "name": "{{SKILL_NAME}}",
  "version": "1.0.0",
  "package": "@adonis0123/{{SKILL_NAME}}",
  "targets": {
    "claude-code": { "enabled": true, "paths": { "global": ".claude/skills", "project": ".claude/skills" } },
    "cursor": { "enabled": true, "paths": { "global": ".cursor/skills", "project": ".cursor/skills" } },
    "codex": { "enabled": true, "paths": { "global": ".codex/skills", "project": ".codex/skills" } }
  }
}
```

**Remote Mode** (fetch from upstream):
```json
{
  "name": "{{SKILL_NAME}}",
  "version": "1.0.0",
  "package": "@adonis0123/{{SKILL_NAME}}",
  "remoteSource": "owner/repo/path/to/skill",
  "files": { "SKILL.md": "SKILL.md", "references": "references/" },
  "targets": { ... }
}
```

### Step 3: Create package.json

Create the npm package configuration:

```json
{
  "name": "@adonis0123/{{SKILL_NAME}}",
  "version": "1.0.0",
  "description": "Claude Code Skill - {{description}}",
  "scripts": {
    "postinstall": "node install-skill.js",
    "preuninstall": "node uninstall-skill.js",
    "test": "node install-skill.js && echo 'Installation test completed.'"
  },
  "files": ["SKILL.md", "references/", "install-skill.js", "uninstall-skill.js", ".claude-skill.json"],
  "author": "adonis",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Adonis0123/agent-skill-npm-boilerplate.git",
    "directory": "packages/{{SKILL_NAME}}"
  }
}
```

### Step 4: Create README.md

Create the package README file for npm and GitHub display:

```markdown
# @adonis0123/{{SKILL_NAME}}

Claude Code 技能 - {{SKILL_DESCRIPTION}}

## 功能特性

- {{Feature 1}}
- {{Feature 2}}

## 安装

\`\`\`bash
npm install -g @adonis0123/{{SKILL_NAME}}
\`\`\`

## 使用方法

在 Claude Code 中使用 `/{{SKILL_NAME}}` 或相关触发词。

## License

MIT
```

Consult `references/templates.md` for the complete README template.

### Step 5: Create SKILL.md

Write the skill definition file following these requirements:

**Frontmatter (Required):**
```yaml
---
name: skill-name
description: This skill should be used when the user asks to "trigger 1", "trigger 2"...
version: 0.1.0
---
```

**Name Field Rules:**
- **MUST use kebab-case format**: lowercase letters with hyphens (e.g., `my-skill-name`)
- **NO spaces, underscores, or capital letters**
- Examples:
  - ✅ `weekly-report`, `agent-browser`, `react-best-practices`
  - ❌ `Weekly Report`, `weekly_report`, `WeeklyReport`

**Writing Style:**
- Use imperative form: "Create the file" (not "You should create")
- Use third person in description: "This skill should be used when..."
- Keep body under 2,000 words
- Move detailed content to `references/` files

**Content Structure:**
1. Brief introduction (2-3 sentences)
2. Core workflow with clear steps
3. Quick reference table
4. Pointers to reference files

### Step 6: Sync and Build

Run the sync script to generate install/uninstall scripts:

```bash
pnpm sync
```

This compiles `shared/src/*.ts` and generates:
- `packages/{{SKILL_NAME}}/install-skill.js`
- `packages/{{SKILL_NAME}}/uninstall-skill.js`

### Step 7: Update Workspace and Documentation

After generating the install scripts, update the workspace and documentation files:

```bash
# Update pnpm-lock.yaml to include the new package in workspace
pnpm install

# Update all documentation files
pnpm sync:docs
```

This step is **CRITICAL** - it ensures:
- The new package is added to `pnpm-lock.yaml`
- All documentation files are updated with the new package:
  - `README.md` and `README.en.md` - Install commands and package table
  - `CLAUDE.md` - Project guide package list
  - `packages/create-skill/SKILL.md` - Project structure examples

**Note**: Always run these commands after creating a new skill package, otherwise the monorepo will be in an inconsistent state.

### Step 8: Test and Verify

Test the package installation:

```bash
cd packages/{{SKILL_NAME}} && npm test
```

Run full test suite:

```bash
pnpm test:all
```

Clean up test files:

```bash
rm -rf packages/{{SKILL_NAME}}/.claude packages/{{SKILL_NAME}}/.cursor
```

### Step 9: Update "更多技能" Template

**IMPORTANT:** Add the new skill to the template so other packages' README will include it.

Edit `templates/more-skills.md` at project root:

```markdown
- [@adonis0123/{{SKILL_NAME}}](https://www.npmjs.com/package/@adonis0123/{{SKILL_NAME}}) - {{简短描述}}
```

Then sync to all packages:

```bash
pnpm sync:skills
```

## Quick Reference

| Step | Command |
|------|---------|
| Create directory | `mkdir -p packages/SKILL_NAME/{references,src}` |
| Sync scripts | `pnpm sync` |
| Update workspace | `pnpm install` |
| Update docs | `pnpm sync:docs` |
| Test package | `cd packages/SKILL_NAME && npm test` |
| Test all | `pnpm test:all` |
| Update "更多技能" | `pnpm sync:skills` |
| Publish | `pnpm publish` |

## Local vs Remote Mode

| Aspect | Local Mode | Remote Mode |
|--------|------------|-------------|
| Content source | Bundled in npm package | Fetched on install |
| Update method | Publish new npm version | Automatic on reinstall |
| Fallback | N/A | Uses bundled version |
| Use case | Original content | Syncing upstream |
| Config | No `remoteSource` | Has `remoteSource` |

**Remote Source Format (degit):**
- `owner/repo` - Repository root
- `owner/repo/path` - Specific directory
- `owner/repo#branch` - Specific branch

## Publishing

Interactive publish (recommended):
```bash
pnpm publish
```

Direct publish:
```bash
cd packages/{{SKILL_NAME}} && npm publish --access public
```

## Additional Resources

### Reference Files

For detailed templates and checklists, consult:
- **`references/templates.md`** - Complete configuration file templates
- **`references/checklist.md`** - Step-by-step verification checklist

### Existing Packages

Study these packages as examples:
- `packages/weekly-report/` - Local mode with Python scripts
- `packages/agent-browser/` - Local mode, minimal structure
- `packages/react-best-practices/` - Remote mode from Vercel
- `packages/skill-development/` - Remote mode from Anthropic

## Best Practices

- Start with clear trigger phrases in the description
- Keep SKILL.md lean, use references/ for details
- Test locally before publishing
- Use remote mode for upstream synchronization
- Follow semantic versioning for updates
