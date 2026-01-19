# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 **Monorepo**，管理多个 Claude Code 技能的 npm 包：

- `@adonis0123/weekly-report` - 周报生成
- `@adonis0123/agent-browser` - 浏览器自动化
- `@adonis0123/react-best-practices` - React 最佳实践
- `@adonis0123/commit` - Git 提交信息生成
- `@adonis0123/staged-changes-review` - 暂存区变更审查
- `@adonis0123/code-doc-generator` - 代码文档生成
- `@adonis0123/skill-development` - 技能开发指南
- `@adonis0123/create-skill` - 创建新技能包
- `@adonis0123/css-tailwind-styling` - CSS/Tailwind 样式规范
- `@adonis0123/cli` - CLI 工具

## 项目结构

```
claude-skills/
├── package.json              # 根配置（private: true）
├── pnpm-workspace.yaml       # workspace 配置
└── packages/
    ├── weekly-report/        # 周报技能
    ├── agent-browser/        # 浏览器自动化技能
    ├── react-best-practices/ # React 最佳实践技能
    ├── commit/               # Git 提交信息生成
    ├── staged-changes-review/# 暂存区变更审查
    ├── code-doc-generator/   # 代码文档生成
    ├── skill-development/    # 技能开发指南
    ├── create-skill/         # 创建新技能包
    ├── css-tailwind-styling/ # CSS/Tailwind 样式规范
    └── cli/                  # CLI 工具
```

## 常用命令

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
