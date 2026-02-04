# @adonis0123/zustand-store-scaffold

Claude Code 技能 - 快速生成符合项目规范的 Zustand Store 脚手架

## 功能特性

- 支持两种 Store 模式：
  - **Web Pattern**: 组件级 Store（`index.ts` + `context.ts` + `provider.tsx`）
  - **Core Pattern**: 基于 Slice 的核心 Store（`createStore` + `immer` + `createCoreSlice`）
- 自动生成完整的 TypeScript 类型定义
- 使用项目中真实的 Store 模式作为模板
- 支持强制覆盖现有文件

## 安装

```bash
npm install -g @adonis0123/zustand-store-scaffold
```

## 使用方法

在 Claude Code 中使用以下触发词：

- "scaffold zustand store"
- "create zustand store"
- "generate zustand store"
- 或在相关 Store 目录下提及 Zustand

### 命令示例

#### Web Pattern（组件级 Store）
```bash
python3 ~/.claude/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py \
  --pattern web \
  --name ToolList \
  --path web/src/pages/_components/ToolList/store
```

#### Core Pattern（核心 Store）

**单个 Slice:**
```bash
python3 ~/.claude/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py \
  --pattern core \
  --name CoreAgent \
  --path packages/ag-ui-view/src/core/helpers/isomorphic/store
```

**多个 Slice（按功能划分）:**
```bash
# 交互式（会询问需要哪些 slice）
python3 ~/.claude/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py \
  --pattern core \
  --name AppStore \
  --path src/store

# 直接指定
python3 ~/.claude/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py \
  --pattern core \
  --name AppStore \
  --path src/store \
  --slices auth,user,ui
```

### 参数说明

| 参数 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `--pattern` | ✅ | Store 模式 (`web` 或 `core`) | `--pattern web` |
| `--name` | ✅ | Store 名称（PascalCase） | `--name ToolList` |
| `--path` | ✅ | 目标目录路径 | `--path src/store` |
| `--slices` | ❌ | Slice 名称列表（仅 core 模式，逗号分隔） | `--slices auth,user,ui` |
| `--force` | ❌ | 覆盖现有文件 | `--force` |

**注意:** 使用 `core` 模式但不指定 `--slices` 时，脚本会交互式询问你需要哪些 slice。

### 查看帮助
```bash
python3 ~/.claude/skills/zustand-store-scaffold/scripts/scaffold_zustand_store.py --help
```

## 生成文件结构

### Web Pattern
```
store/
├── index.ts         # Store 定义
├── context.ts       # React Context
└── provider.tsx     # Provider 组件
```

### Core Pattern（单个 Slice）
```
store/
├── index.ts         # Store 导出
└── slices/
    └── core.ts      # Core Slice
```

### Core Pattern（多个 Slice）
```
store/
├── index.ts         # Store 工厂（自动组合所有 slice）
└── slices/
    ├── auth.ts      # Auth Slice
    ├── user.ts      # User Slice
    └── ui.ts        # UI Slice
```

## 参考文档

- 查看 `references/store-patterns.md` 了解项目 Store 模式详情
- 查看 `assets/templates/` 了解模板结构

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 提交信息生成
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 代码审查
- [@adonis0123/create-skill](https://www.npmjs.com/package/@adonis0123/create-skill) - 创建新技能包
- [@adonis0123/code-doc-generator](https://www.npmjs.com/package/@adonis0123/code-doc-generator) - 代码文档生成
- [@adonis0123/css-tailwind-styling](https://www.npmjs.com/package/@adonis0123/css-tailwind-styling) - CSS 和 Tailwind 样式规范

## License

MIT
