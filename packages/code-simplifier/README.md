# @adonis0123/code-simplifier

[![npm version](https://badge.fury.io/js/@adonis0123%2Fcode-simplifier.svg)](https://www.npmjs.com/package/@adonis0123/code-simplifier)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Claude Code 技能** - 代码质量优化专家，专注于清晰度、一致性、可维护性

基于 [Anthropic 官方 code-simplifier 插件](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)，安装时自动从上游仓库拉取最新版本。

## 安装

### 全局安装（推荐）

```bash
npm install -g @adonis0123/code-simplifier
```

安装后，技能会自动配置到：
- `~/.claude/skills/code-simplifier/`（Claude Code）
- `~/.cursor/skills/code-simplifier/`（Cursor IDE）

### 项目本地安装

```bash
npm install @adonis0123/code-simplifier
```

技能会安装到项目的 `.claude/skills/` 和 `.cursor/skills/` 目录。

## 使用

安装后，在 Claude Code 中直接使用：

```
/code-simplifier
```

或通过自然语言触发：
- "简化这段代码"
- "优化代码可读性"
- "重构这个函数"
- "帮我改进代码质量"

## 功能特性

### 5 个核心原则

1. **保持功能不变** - 仅优化代码质量，不改变业务逻辑
2. **应用项目标准** - 遵循项目 `CLAUDE.md` 中的编码规范
3. **增强清晰度** - 改善命名、减少嵌套、消除冗余
4. **保持平衡** - 避免过度工程化，兼顾性能和可读性
5. **聚焦范围** - 仅优化明确指定的代码部分

### 6 步工作流程

1. **理解上下文** - 读取项目编码标准和技术栈
2. **识别优化点** - 扫描嵌套、命名、重复等问题
3. **评估影响** - 分析收益、风险、成本
4. **提出方案** - 提供前后对比和改进理由
5. **实施优化** - 按优先级逐步改进
6. **验证结果** - 确认功能一致性和标准符合性

### 自动触发

以下关键词会自动激活此技能：
- 简化代码、优化代码、重构代码
- 提升可读性、改善代码质量
- 代码审查、代码清理

## 优化示例

**优化前**：
```javascript
function getUserStatus(user) {
  if (user) {
    if (user.isActive) {
      if (user.isPremium) {
        return 'premium-active';
      } else {
        return 'basic-active';
      }
    } else {
      return 'inactive';
    }
  } else {
    return 'unknown';
  }
}
```

**优化后**：
```javascript
function getUserStatus(user) {
  if (!user) return 'unknown';
  if (!user.isActive) return 'inactive';
  return user.isPremium ? 'premium-active' : 'basic-active';
}
```

**改进点**：
- 使用 guard clauses 减少嵌套层级
- 提升代码可读性
- 保持功能完全一致

## 参考资料

安装后可在以下位置查看补充资源：

```
~/.claude/skills/code-simplifier/references/
├── CLAUDE.md-example.md        # 项目编码标准示例
├── coding-standards.md          # 通用编码标准
└── simplification-examples.md   # 实际简化案例集
```

这些资源包含：
- 如何配置项目的 `CLAUDE.md`
- 常见代码质量问题和解决方案
- 6 个实际代码简化案例（嵌套、冗余、命名、React 等）

## 工作原理

1. **远程优先**: 安装时通过 `degit` 从 Anthropic 官方仓库获取最新 `agents/code-simplifier.md`
2. **本地 Fallback**: 如果网络失败，使用打包的本地版本
3. **补充内容**: 本地 `references/` 提供额外的实用资源

## 卸载

```bash
npm uninstall -g @adonis0123/code-simplifier
```

卸载时会自动清理配置文件。

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
## 许可

MIT License - 基于 Anthropic 官方插件

## 链接

- [npm 包](https://www.npmjs.com/package/@adonis0123/code-simplifier)
- [GitHub 仓库](https://github.com/Adonis0123/agent-skill-npm-boilerplate/tree/main/packages/code-simplifier)
- [上游源](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)
