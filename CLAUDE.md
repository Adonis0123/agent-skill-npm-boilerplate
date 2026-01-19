# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 **Monorepo**，管理多个 Claude Code 技能的 npm 包：

- `@adonis0123/agent-browser` - 浏览器自动化，支持网页测试、表单填写、截图和数据提取
- `@adonis0123/skill-cli` - CLI tool for managing AI Agent Skills - Install, update, list, and manage skills for Claude Code, Cursor, Codex, and more
- `@adonis0123/code-doc-generator` - 自动分析代码仓库并生成包含 Mermaid 流程图的 README.md 文档
- `@adonis0123/commit` - 根据暂存的代码变更自动生成符合 Conventional Commits 规范的提交信息
- `@adonis0123/create-skill` - 项目专属技能创建工具，用于快速创建新的 skill 包
- `@adonis0123/css-tailwind-styling` - CSS 和 Tailwind CSS 样式规范与最佳实践
- `@adonis0123/react-best-practices` - React 和 Next.js 性能优化最佳实践指南，来自 Vercel Engineering。安装时自动从上游仓库拉取最新版本。
- `@adonis0123/skill-development` - 技能开发指南，提供创建有效技能的完整流程和最佳实践。安装时自动从 Anthropic 官方仓库拉取最新版本。
- `@adonis0123/staged-changes-review` - Comprehensive review of staged Git changes for risk assessment, error detection, and impact analysis
- `@adonis0123/weekly-report` - 自动读取 Git 提交记录生成周报，支持多仓库汇总和智能过滤


## 项目结构

```
claude-skills/
├── package.json              # 根配置（private: true）
├── pnpm-workspace.yaml       # workspace 配置
└── packages/
    ├── agent-browser/           # 浏览器自动化，支持网页测试、表单填写、截图和数据提取
    ├── cli/                     # CLI tool for managing AI Agent...
    ├── code-doc-generator/      # 自动分析代码仓库并生成包含 Mermaid 流程图的 REA...
    ├── commit/                  # 根据暂存的代码变更自动生成符合 Conventional C...
    ├── create-skill/            # 项目专属技能创建工具，用于快速创建新的 skill 包
    ├── css-tailwind-styling/    # CSS 和 Tailwind CSS 样式规范与最佳实践
    ├── react-best-practices/    # React 和 Next.js 性能优化最佳实践指南，来自 ...
    ├── skill-development/       # 技能开发指南，提供创建有效技能的完整流程和最佳实践。安装时自...
    ├── staged-changes-review/   # Comprehensive review of staged...
    └── weekly-report/           # 自动读取 Git 提交记录生成周报，支持多仓库汇总和智能过滤
```

## 常用命令

### 本地安装技能

```bash
# 方法 1：交互式选择安装（推荐）
pnpm install:select

# 方法 2：直接运行安装脚本
cd packages/weekly-report && node install-skill.js

# 方法 3：安装所有包
pnpm -r install
```

### 测试与发布

```bash
# 测试所有包
pnpm test:all

# 测试单个包
cd packages/agent-browser && npm test

# 发布所有包
pnpm publish:all

# 发布单个包
cd packages/weekly-report && npm publish --access public
```

## 添加新技能

1. 创建 `packages/new-skill/` 目录
2. 复制 `install-skill.js`、`uninstall-skill.js`、`utils.js`
3. 创建 `SKILL.md`（技能定义）
4. 创建 `package.json` 和 `.claude-skill.json`
5. 测试：`npm test`
6. 发布：`npm publish --access public`

## 子包结构

每个技能包都包含：

```
packages/skill-name/
├── package.json          # npm 包配置
├── .claude-skill.json    # 技能安装配置
├── SKILL.md              # 技能定义（核心）
├── install-skill.js      # 安装脚本
├── uninstall-skill.js    # 卸载脚本
└── utils.js              # 工具函数
```

## 安装脚本工作原理

1. `npm install -g @adonis0123/skill` 触发 `postinstall`
2. `install-skill.js` 读取 `.claude-skill.json`
3. 复制 `SKILL.md` 和配置的文件到 `~/.claude/skills/skill-name/`
4. 用户即可在 Claude Code 中使用 `/skill-name`
