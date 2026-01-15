# @adonis0123/skill-cli

CLI tool for managing AI Agent Skills - Install, update, list, and manage skills for Claude Code, Cursor, Codex, and more.

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 🚀 Quick Start

```bash
# Install CLI globally
npm i -g @adonis0123/skill-cli

# Install a skill
skill install anthropics/skills/skills/pdf

# List installed skills
skill list

# Update all skills
skill update
```

## 📦 Install Skills

### Install Our Skills

```bash
# React/Next.js Best Practices (from Vercel Engineering)
skill install vercel-labs/agent-skills/skills/react-best-practices

# Weekly Report Generator
skill install Adonis0123/agent-skill-npm-boilerplate/packages/weekly-report

# Browser Automation
skill install Adonis0123/agent-skill-npm-boilerplate/packages/agent-browser
```

### Install from Other Sources

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

# Install to project-level (instead of global)
skill install anthropics/skills/skills/pdf --local
```

## 🎯 Multi-platform Support

Supports multiple AI coding assistants:

| Platform | Flag | Global Directory | Project Directory |
|----------|------|------------------|-------------------|
| Claude Code | `-t claude` (default) | `~/.claude/skills` | `.claude/skills` |
| Cursor | `-t cursor` | `~/.cursor/skills` | `.cursor/skills` |
| Codex | `-t codex` | `~/.codex/skills` | `.codex/skills` |
| GitHub Copilot | `-t copilot` | `~/.copilot/skills` | `.copilot/skills` |

```bash
# Install to Cursor
skill install anthropics/skills/skills/pdf -t cursor

# Install to all platforms
skill install anthropics/skills/skills/pdf --all

# List skills for specific platform
skill list -t cursor
```

## 🔧 Manage Skills

```bash
# List all installed skills
skill list

# List with install paths
skill list --paths

# Show skill details
skill info pdf

# Update a specific skill
skill update pdf

# Update all skills
skill update

# Uninstall a skill
skill uninstall pdf
```

## 📋 All Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `skill install <source>` | `i` | Install a skill from Git URL, degit shorthand, or local directory |
| `skill list` | `ls` | List installed skills |
| `skill info <skill>` | - | Show skill details |
| `skill update [skill]` | `up` | Update one or all installed skills |
| `skill uninstall <skill>` | `rm` | Remove a skill |

### Common Options

| Option | Description |
|--------|-------------|
| `-t, --target <platform>` | Target platform (claude, cursor, codex, copilot) |
| `-l, --local` | Use project-level directory instead of global |
| `-f, --force` | Force operation (overwrite/remove) |
| `--json` | Output JSON format |

## 📄 License

MIT
