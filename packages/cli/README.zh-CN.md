# @adonis0123/skill-cli

> ⚠️ **已废弃**：本仓库中的 Skills 已迁移至 [adonis-skills.vercel.app](https://adonis-skills.vercel.app/)，此处内容不再维护。


AI Agent 技能管理 CLI 工具 - 安装、更新、列出和管理 Claude Code、Cursor、Codex 等平台的技能。

## 🚀 快速开始

```bash
# 全局安装 CLI
npm i -g @adonis0123/skill-cli

# 安装技能
skill install anthropics/skills/skills/pdf

# 列出已安装技能
skill list

# 更新所有技能
skill update
```

## 📦 安装技能

### 安装我们提供的技能

```bash
# React/Next.js 最佳实践（来自 Vercel Engineering）
skill install vercel-labs/agent-skills/skills/react-best-practices

# 周报生成
skill install Adonis0123/agent-skill-npm-boilerplate/packages/weekly-report

# 浏览器自动化
skill install Adonis0123/agent-skill-npm-boilerplate/packages/agent-browser
```

### 安装其他来源的技能

```bash
# 从 GitHub (degit shorthand)
skill install anthropics/skills/skills/pdf

# 从完整 GitHub URL
skill install https://github.com/anthropics/skills/tree/main/skills/pdf

# 从本地目录
skill install ./my-skill

# 安装到特定平台
skill install anthropics/skills/skills/pdf -t cursor

# 安装到所有平台
skill install anthropics/skills/skills/pdf --all

# 强制重新安装
skill install anthropics/skills/skills/pdf --force

# 安装到项目级目录（而非全局）
skill install anthropics/skills/skills/pdf --local
```

## 🎯 多平台支持

支持多个 AI 编程助手：

| 平台 | 参数 | 全局目录 | 项目目录 |
|------|------|----------|----------|
| Claude Code | `-t claude` (默认) | `~/.claude/skills` | `.claude/skills` |
| Cursor | `-t cursor` | `~/.cursor/skills` | `.cursor/skills` |
| Codex | `-t codex` | `~/.codex/skills` | `.codex/skills` |
| GitHub Copilot | `-t copilot` | `~/.copilot/skills` | `.copilot/skills` |

```bash
# 安装到 Cursor
skill install anthropics/skills/skills/pdf -t cursor

# 安装到所有平台
skill install anthropics/skills/skills/pdf --all

# 列出特定平台的技能
skill list -t cursor
```

## 🔧 管理技能

```bash
# 列出所有已安装技能
skill list

# 显示安装路径
skill list --paths

# 查看技能详情
skill info pdf

# 更新特定技能
skill update pdf

# 更新所有技能
skill update

# 卸载技能
skill uninstall pdf
```

## 📋 所有命令

| 命令 | 别名 | 描述 |
|------|------|------|
| `skill install <source>` | `i` | 从 Git URL、degit shorthand 或本地目录安装技能 |
| `skill list` | `ls` | 列出已安装的技能 |
| `skill info <skill>` | - | 显示技能详情 |
| `skill update [skill]` | `up` | 更新一个或所有技能 |
| `skill uninstall <skill>` | `rm` | 卸载技能 |

### 通用选项

| 选项 | 描述 |
|------|------|
| `-t, --target <platform>` | 目标平台 (claude, cursor, codex, copilot) |
| `-l, --local` | 使用项目级目录而非全局目录 |
| `-f, --force` | 强制操作（覆盖/删除） |
| `--json` | 输出 JSON 格式 |

## 📄 License

MIT
