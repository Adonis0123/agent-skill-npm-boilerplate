# Skill Package Configuration Templates

This file contains all configuration file templates for creating new skill packages in this monorepo.

## .claude-skill.json Templates

### Local Mode Template (No Remote Source)

Use this when the skill content is bundled with the npm package:

```json
{
  "name": "{{SKILL_NAME}}",
  "version": "1.0.0",
  "package": "@adonis0123/{{SKILL_NAME}}",
  "files": {
    "references": "references/",
    "src": "src/"
  },
  "targets": {
    "claude-code": {
      "enabled": true,
      "paths": {
        "global": ".claude/skills",
        "project": ".claude/skills"
      }
    },
    "cursor": {
      "enabled": true,
      "paths": {
        "global": ".cursor/skills",
        "project": ".cursor/skills"
      }
    },
    "windsurf": {
      "enabled": false,
      "paths": {
        "global": ".windsurf/skills",
        "project": ".windsurf/skills"
      }
    },
    "aider": {
      "enabled": false,
      "paths": {
        "global": ".aider/skills",
        "project": ".aider/skills"
      }
    },
    "custom": {
      "enabled": false,
      "paths": {
        "global": ".ai-skills",
        "project": ".ai-skills"
      }
    }
  }
}
```

### Remote Mode Template (With Remote Source)

Use this when the skill should fetch latest content from a remote repository:

```json
{
  "name": "{{SKILL_NAME}}",
  "version": "1.0.0",
  "package": "@adonis0123/{{SKILL_NAME}}",
  "remoteSource": "{{GITHUB_OWNER}}/{{GITHUB_REPO}}/{{PATH_TO_SKILL}}",
  "files": {
    "SKILL.md": "SKILL.md",
    "references": "references/"
  },
  "targets": {
    "claude-code": {
      "enabled": true,
      "paths": {
        "global": ".claude/skills",
        "project": ".claude/skills"
      }
    },
    "cursor": {
      "enabled": true,
      "paths": {
        "global": ".cursor/skills",
        "project": ".cursor/skills"
      }
    },
    "windsurf": {
      "enabled": false,
      "paths": {
        "global": ".windsurf/skills",
        "project": ".windsurf/skills"
      }
    },
    "aider": {
      "enabled": false,
      "paths": {
        "global": ".aider/skills",
        "project": ".aider/skills"
      }
    },
    "custom": {
      "enabled": false,
      "paths": {
        "global": ".ai-skills",
        "project": ".ai-skills"
      }
    }
  }
}
```

**Remote Source Format (degit):**
- `owner/repo` - Root of repository
- `owner/repo/path/to/dir` - Specific directory
- `owner/repo#branch` - Specific branch
- `owner/repo/path#tag` - Specific tag

**Examples:**
- `anthropics/claude-code/plugins/plugin-dev/skills/skill-development`
- `vercel-labs/agent-skills/skills/react-best-practices`

---

## package.json Template

```json
{
  "name": "@adonis0123/{{SKILL_NAME}}",
  "version": "1.0.0",
  "description": "Claude Code Skill - {{SKILL_DESCRIPTION}}",
  "scripts": {
    "postinstall": "node install-skill.js",
    "preuninstall": "node uninstall-skill.js",
    "test": "node install-skill.js && echo 'Installation test completed.'"
  },
  "files": [
    "SKILL.md",
    "references/",
    "src/",
    "install-skill.js",
    "uninstall-skill.js",
    ".claude-skill.json"
  ],
  "keywords": [
    "claude-code",
    "skill",
    "{{KEYWORD_1}}",
    "{{KEYWORD_2}}"
  ],
  "author": "adonis",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Adonis0123/agent-skill-npm-boilerplate.git",
    "directory": "packages/{{SKILL_NAME}}"
  },
  "homepage": "https://github.com/Adonis0123/agent-skill-npm-boilerplate/tree/main/packages/{{SKILL_NAME}}"
}
```

**Required Fields:**
- `name` - npm package name with @adonis0123 scope
- `version` - Semantic version (start with 1.0.0)
- `description` - Clear description of the skill
- `scripts.postinstall` - Must be `node install-skill.js`
- `scripts.preuninstall` - Must be `node uninstall-skill.js`
- `scripts.test` - Test command for verification
- `files` - List of files to include in npm package

**Optional but Recommended:**
- `keywords` - For npm search discoverability
- `repository` - Link to source code
- `homepage` - Link to package documentation

---

## SKILL.md Template

```markdown
---
name: {{Skill Name}}
description: This skill should be used when the user asks to "{{trigger phrase 1}}", "{{trigger phrase 2}}", "{{trigger phrase 3}}", or needs guidance on {{domain}}. {{Brief functionality description}}.
version: 0.1.0
---

# {{Skill Title}}

{{Brief introduction - 2-3 sentences explaining what this skill does.}}

## Overview

{{Core concepts and purpose of the skill.}}

## When to Use This Skill

This skill is designed for:
- {{Use case 1}}
- {{Use case 2}}
- {{Use case 3}}

## Core Workflow

### Step 1: {{First Step}}

{{Instructions in imperative form.}}

### Step 2: {{Second Step}}

{{Instructions in imperative form.}}

### Step 3: {{Third Step}}

{{Instructions in imperative form.}}

## Quick Reference

| Action | Command/Method |
|--------|----------------|
| {{Action 1}} | {{Command 1}} |
| {{Action 2}} | {{Command 2}} |

## Common Patterns

### Pattern 1: {{Pattern Name}}

{{Description and example.}}

### Pattern 2: {{Pattern Name}}

{{Description and example.}}

## Additional Resources

### Reference Files

For detailed information, consult:
- **`references/{{file1}}.md`** - {{Description}}
- **`references/{{file2}}.md`** - {{Description}}

## Best Practices

- {{Practice 1}}
- {{Practice 2}}
- {{Practice 3}}

## Troubleshooting

### Issue: {{Common Issue}}

**Solution:** {{How to fix it.}}
```

**Writing Style Requirements:**
- Use **imperative/infinitive form** (e.g., "Create the file" not "You should create")
- Use **third person** in description (e.g., "This skill should be used when...")
- Keep body **under 2,000 words**
- Move detailed content to `references/` files

---

## README.md Template

```markdown
# @adonis0123/{{SKILL_NAME}}

Claude Code 技能 - {{SKILL_DESCRIPTION}}

## 功能特性

- {{Feature 1}}
- {{Feature 2}}
- {{Feature 3}}

## 安装

\`\`\`bash
npm install -g @adonis0123/{{SKILL_NAME}}
\`\`\`

安装后自动部署到 `~/.claude/skills/{{SKILL_NAME}}/`。

## 使用方法

在 Claude Code 中：

\`\`\`
/{{SKILL_NAME}}
\`\`\`

或直接说：
- "{{trigger phrase 1}}"
- "{{trigger phrase 2}}"

## 示例

{{Example usage or output}}

## License

MIT
```

**Required Sections:**
- Package name and description
- Installation command
- Basic usage

**Optional Sections:**
- Features list
- Examples
- Configuration options
- Troubleshooting

---

## Directory Structure Examples

### Minimal Skill Package

```
packages/my-skill/
├── .claude-skill.json
├── package.json
└── SKILL.md
```

### Standard Skill Package

```
packages/my-skill/
├── .claude-skill.json
├── package.json
├── SKILL.md
└── references/
    └── detailed-guide.md
```

### Complete Skill Package

```
packages/my-skill/
├── .claude-skill.json
├── package.json
├── SKILL.md
├── references/
│   ├── patterns.md
│   └── advanced.md
├── src/
│   └── helper-script.py
└── assets/
    └── template.json
```

---

## Placeholder Reference

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SKILL_NAME}}` | Skill identifier (kebab-case) | `my-awesome-skill` |
| `{{SKILL_DESCRIPTION}}` | Brief description | `A tool for automating X` |
| `{{GITHUB_OWNER}}` | GitHub username/org | `anthropics` |
| `{{GITHUB_REPO}}` | Repository name | `claude-code` |
| `{{PATH_TO_SKILL}}` | Path within repo | `plugins/skills/my-skill` |
| `{{KEYWORD_N}}` | npm keywords | `automation`, `ai` |
| `{{trigger phrase N}}` | User trigger phrases | `create X`, `generate Y` |
