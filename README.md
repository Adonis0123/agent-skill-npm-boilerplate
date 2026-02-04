简体中文 | [English](./README.en.md)

---

# Agent Skills

> AI Agent 技能管理工具集 - 包含 CLI 工具和多个可安装的技能包

## 🚀 快速开始

### 克隆项目后初始化

```bash
git clone https://github.com/Adonis0123/agent-skill-npm-boilerplate.git
cd agent-skill-npm-boilerplate
pnpm setup
```

`pnpm setup` 会自动安装依赖、同步脚本，并安装 `create-skill` 技能到项目。

### 方式一：使用 CLI 工具（推荐）

```bash
# 安装 CLI
npm i -g @adonis0123/skill-cli

# 安装技能
skill install anthropics/skills/skills/pdf

# 列出已安装技能
skill list

# 更新所有技能
skill update
```

### 方式二：直接安装技能包

```bash
# 安装单个技能
npm i -g @adonis0123/weekly-report

# 安装后自动部署到 ~/.claude/skills/
```

#### 一键安装所有包

```bash
# 复制下面的命令,一次性安装所有技能包
npm i -g @adonis0123/agent-browser @adonis0123/skill-cli @adonis0123/code-doc-generator @adonis0123/code-simplifier @adonis0123/commit @adonis0123/css-tailwind-styling @adonis0123/react-best-practices @adonis0123/skill-development @adonis0123/spec-flow @adonis0123/staged-changes-review @adonis0123/staged-simplifier @adonis0123/weekly-report @adonis0123/zustand-store-scaffold
```

或者分行安装（更清晰）：

```bash
npm i -g @adonis0123/agent-browser && \
npm i -g @adonis0123/skill-cli && \
npm i -g @adonis0123/code-doc-generator && \
npm i -g @adonis0123/code-simplifier && \
npm i -g @adonis0123/commit && \
npm i -g @adonis0123/css-tailwind-styling && \
npm i -g @adonis0123/react-best-practices && \
npm i -g @adonis0123/skill-development && \
npm i -g @adonis0123/spec-flow && \
npm i -g @adonis0123/staged-changes-review && \
npm i -g @adonis0123/staged-simplifier && \
npm i -g @adonis0123/weekly-report && \
npm i -g @adonis0123/zustand-store-scaffold

```

---

## 📦 包含的包

| 包名 | 描述 | 安装命令 |
|------|------|----------|
| [@adonis0123/agent-browser](./packages/agent-browser) | 浏览器自动化，支持网页测试、表单填写、截图和数据提取 | `npm i -g @adonis0123/agent-browser` |
| [@adonis0123/skill-cli](./packages/cli) | CLI tool for managing AI Agent Skills - Install, update, list, and manage skills for Claude Code, Cursor, Codex, and more | `npm i -g @adonis0123/skill-cli` |
| [@adonis0123/code-doc-generator](./packages/code-doc-generator) | 自动分析代码仓库并生成包含 Mermaid 流程图的 README.md 文档 | `npm i -g @adonis0123/code-doc-generator` |
| [@adonis0123/code-simplifier](./packages/code-simplifier) | 代码质量优化，专注于清晰度、一致性、可维护性。安装时自动从 Anthropic 官方仓库拉取最新版本。 | `npm i -g @adonis0123/code-simplifier` |
| [@adonis0123/commit](./packages/commit) | 根据暂存的代码变更自动生成符合 Conventional Commits 规范的提交信息 | `npm i -g @adonis0123/commit` |
| [@adonis0123/create-skill](./packages/create-skill) | 项目专属技能创建工具，用于快速创建新的 skill 包 | - |
| [@adonis0123/css-tailwind-styling](./packages/css-tailwind-styling) | CSS 和 Tailwind CSS 样式规范与最佳实践 | `npm i -g @adonis0123/css-tailwind-styling` |
| [@adonis0123/react-best-practices](./packages/react-best-practices) | React 和 Next.js 性能优化最佳实践指南，来自 Vercel Engineering。安装时自动从上游仓库拉取最新版本。 | `npm i -g @adonis0123/react-best-practices` |
| [@adonis0123/skill-development](./packages/skill-development) | 技能开发指南，提供创建有效技能的完整流程和最佳实践。安装时自动从 Anthropic 官方仓库拉取最新版本。 | `npm i -g @adonis0123/skill-development` |
| [@adonis0123/spec-flow](./packages/spec-flow) | Structured, specification-driven development workflow with living documentation | `npm i -g @adonis0123/spec-flow` |
| [@adonis0123/staged-changes-review](./packages/staged-changes-review) | Comprehensive review of staged Git changes for risk assessment, error detection, and impact analysis | `npm i -g @adonis0123/staged-changes-review` |
| [@adonis0123/staged-simplifier](./packages/staged-simplifier) | Apply code-simplifier principles to staged Git changes before commit | `npm i -g @adonis0123/staged-simplifier` |
| [@adonis0123/weekly-report](./packages/weekly-report) | 自动读取 Git 提交记录生成周报，支持多仓库汇总和智能过滤 | `npm i -g @adonis0123/weekly-report` |
| [@adonis0123/zustand-store-scaffold](./packages/zustand-store-scaffold) | Scaffold Zustand stores quickly using repo patterns | `npm i -g @adonis0123/zustand-store-scaffold` |

> **注意**：`@adonis0123/create-skill` 是私有包，不会发布到 npm，仅供本项目内部使用。

---

## 🛠️ CLI 工具使用

### 安装技能

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

### 管理技能

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

### 多平台支持

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

# 列出 Cursor 的技能
skill list -t cursor
```

### 所有命令

| 命令 | 别名 | 描述 |
|------|------|------|
| `skill install <source>` | `i` | 从 Git URL、degit shorthand 或本地目录安装技能 |
| `skill list` | `ls` | 列出已安装的技能 |
| `skill info <skill>` | - | 显示技能详情 |
| `skill update [skill]` | `up` | 更新一个或所有技能 |
| `skill uninstall <skill>` | `rm` | 卸载技能 |

---

## 📚 技能详情

### weekly-report

自动读取 Git 提交记录，按项目分组生成结构化周报。

- 支持多仓库汇总
- 智能过滤琐碎提交（typo、merge、format）
- 灵活时间范围（本周、上周、自定义）

```bash
npm i -g @adonis0123/weekly-report
```

在 Claude Code 中使用：`/weekly-report`

### agent-browser

基于 Playwright 的浏览器自动化工具。

- 网页导航和交互
- 表单填写
- 截图
- 数据提取

```bash
npm i -g @adonis0123/agent-browser
```

在 Claude Code 中使用：`/agent-browser`

### react-best-practices

来自 Vercel Engineering 的 React/Next.js 性能优化指南。

- 45 条优化规则，8 个优先级分类
- 详细代码示例
- **安装时自动从上游仓库拉取最新版本**

```bash
npm i -g @adonis0123/react-best-practices
```

在 Claude Code 中使用：`/react-best-practices`

### skill-development

来自 Anthropic 官方的 Claude Code 技能开发指南。

- 技能结构和设计原则（Progressive Disclosure）
- 创建技能的完整流程（6 步骤）
- 最佳实践和验证清单
- **安装时自动从上游仓库拉取最新版本**

```bash
npm i -g @adonis0123/skill-development
```

在 Claude Code 中使用：`/skill-development`

### commit

自动生成符合 Conventional Commits 规范的 Git 提交信息。

- 分析暂存的代码变更
- 自动选择合适的 type 和 emoji 前缀
- 支持中英文提交信息

```bash
npm i -g @adonis0123/commit
```

在 Claude Code 中使用：`/commit`

### staged-changes-review

暂存变更的全面审查工具。

- 风险评估和错误检测
- 影响分析
- 提交前验证建议

```bash
npm i -g @adonis0123/staged-changes-review
```

在 Claude Code 中使用：`/staged-changes-review`

### code-doc-generator

自动分析代码仓库并生成 README 文档。

- 架构图和流程图（Mermaid）
- 功能说明和代码流程可视化
- 支持多种编程语言

```bash
npm i -g @adonis0123/code-doc-generator
```

在 Claude Code 中使用：`/code-doc-generator`

### css-tailwind-styling

CSS 和 Tailwind CSS 样式规范与最佳实践指南。

- Tailwind CSS 类排序和组件抽象
- 传统 CSS 规范（BEM、属性排序）
- 响应式设计和性能优化
- 无障碍访问（WCAG AA 合规）

```bash
npm i -g @adonis0123/css-tailwind-styling
```

在 Claude Code 中使用：`/css-tailwind-styling`

### create-skill（私有）

项目专属的技能创建工具，用于快速创建新的 skill 包。

- 6 步创建流程指南
- 完整的配置文件模板
- 详细的验证检查清单

> 此包不发布到 npm，克隆项目后运行 `pnpm setup` 自动安装。

在 Claude Code 中使用：`/create-skill`

---

## 🔧 开发者指南

### 项目结构

```
agent-skill-npm-boilerplate/
├── package.json              # 根配置（private: true）
├── pnpm-workspace.yaml       # workspace 配置
├── shared/                   # 共享源码（TypeScript）
│   └── src/
│       ├── types.ts          # 类型定义
│       ├── utils.ts          # 工具函数
│       ├── install-skill.ts  # 安装脚本
│       └── uninstall-skill.ts# 卸载脚本
├── scripts/
│   └── sync-shared.ts        # 同步脚本（esbuild 打包）
└── packages/
    ├── cli/                  # CLI 工具
    │   ├── src/
    │   │   ├── index.ts      # 主入口
    │   │   ├── types.ts      # 类型定义
    │   │   ├── utils.ts      # 工具函数
    │   │   └── commands/     # 命令实现
    │   └── package.json
    ├── weekly-report/        # 周报技能
    ├── agent-browser/        # 浏览器自动化技能
    ├── react-best-practices/ # React 最佳实践技能
    ├── skill-development/    # 技能开发指南（远程同步）
    ├── commit/               # 提交信息生成
    ├── staged-changes-review/# 暂存变更审查
    ├── code-doc-generator/   # 代码文档生成
    ├── css-tailwind-styling/ # CSS/Tailwind 样式规范
    └── create-skill/         # 技能创建工具（私有）
```

### 共享代码架构

技能包的安装/卸载脚本使用 TypeScript 编写，通过 esbuild 打包后同步到各包：

```
shared/src/*.ts  →  esbuild 打包  →  packages/*/install-skill.js
                                  →  packages/*/uninstall-skill.js
```

**特性：**
- **强类型**：所有代码用 TypeScript 编写
- **自动检测模式**：根据 `.claude-skill.json` 中的 `remoteSource` 字段自动选择本地或远程模式
- **单文件打包**：每个包的脚本是独立的单文件，无需处理模块路径

### 常用命令

```bash
# 克隆后初始化（安装依赖 + 同步脚本 + 安装 create-skill）
pnpm setup

# 安装依赖
pnpm install

# 同步共享代码到各包（修改 shared/ 后需要执行）
pnpm sync

# 构建 CLI
cd packages/cli && pnpm build

# 测试所有包
pnpm test:all

# 发布所有包（自动执行 sync）
pnpm publish:all

# 发布单个包
pnpm release:weekly-report
pnpm release:agent-browser
pnpm release:react-best-practices
```

### 添加新技能

推荐使用 `create-skill` 技能来创建新的 skill 包：

```bash
# 确保已运行 pnpm setup
# 在 Claude Code 中说 "创建一个新的 skill 包" 或 "/create-skill"
```

或手动创建：

1. 创建 `packages/new-skill/` 目录
2. 创建必要文件：
   - `.claude-skill.json` - 技能配置
   - `SKILL.md` - 技能定义（核心）
   - `package.json` - npm 包配置
3. 运行 `pnpm sync` 自动生成安装脚本
4. 测试：`npm test`
5. 发布：`npm publish --access public`

### 技能包结构

```
packages/skill-name/
├── package.json          # npm 包配置
├── .claude-skill.json    # 技能安装配置
├── SKILL.md              # 技能定义（核心）
├── install-skill.js      # ← 自动生成（pnpm sync）
├── uninstall-skill.js    # ← 自动生成（pnpm sync）
└── README.md             # 说明文档
```

### .claude-skill.json 配置

```jsonc
{
  "name": "skill-name",           // 技能名称
  "version": "1.0.0",             // 版本号
  "package": "@scope/skill-name", // npm 包名
  "remoteSource": "owner/repo/path", // 可选：远程源（有此字段则启用远程模式）
  "files": {                      // 可选：额外文件映射
    "src": "src/",
    "config.json": "config.json"
  },
  "targets": {                    // 安装目标平台
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

### 发布流程

```bash
# 1. 登录 npm
npm login

# 2. 更新版本并发布单个包
pnpm release:weekly-report

# 或批量发布
pnpm version:patch  # 更新所有包版本
pnpm publish:all    # 发布所有包（自动执行 sync）
```

---

## 📄 License

MIT
