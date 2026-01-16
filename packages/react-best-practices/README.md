# @adonis0123/react-best-practices

> Claude Code 技能 - React 和 Next.js 性能优化最佳实践（来自 Vercel Engineering）

[![npm version](https://img.shields.io/npm/v/@adonis0123/react-best-practices.svg)](https://www.npmjs.com/package/@adonis0123/react-best-practices)

**原始项目**: [vercel-labs/agent-skills/react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)

## 安装

```bash
npm install -g @adonis0123/react-best-practices
```

## 使用

安装后，Claude Code 在编写或审查 React/Next.js 代码时会自动应用这些最佳实践。

## 规则分类

| 优先级 | 分类 | 影响 |
|--------|------|------|
| 1 | 消除瀑布流 | 关键 |
| 2 | 包体积优化 | 关键 |
| 3 | 服务端性能 | 高 |
| 4 | 客户端数据获取 | 中高 |
| 5 | 重渲染优化 | 中 |
| 6 | 渲染性能 | 中 |
| 7 | JavaScript 性能 | 低中 |
| 8 | 高级模式 | 低 |

## 核心规则

### 消除瀑布流（关键）
- `async-parallel` - 使用 Promise.all() 并行请求
- `async-suspense-boundaries` - 使用 Suspense 流式传输

### 包体积优化（关键）
- `bundle-barrel-imports` - 避免 barrel 文件，直接导入
- `bundle-dynamic-imports` - 使用 next/dynamic 懒加载

### 服务端性能（高）
- `server-cache-react` - 使用 React.cache() 去重
- `server-parallel-fetching` - 并行获取数据

### 重渲染优化（中）
- `rerender-memo` - 提取昂贵计算到 memo 组件
- `rerender-functional-setstate` - 使用函数式 setState

## 包含内容

- 45 条优化规则
- 每条规则包含错误/正确代码示例
- 详细的影响说明

## 致谢

Originally created by [@shuding](https://x.com/shuding) at [Vercel](https://vercel.com).

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南

---

## 开发者文档

以下是原始项目的开发文档，供贡献者参考。

### 项目结构

- `rules/` - 独立规则文件（每条规则一个文件）
  - `_sections.md` - 分类元数据（标题、影响、描述）
  - `_template.md` - 创建新规则的模板
  - `area-description.md` - 独立规则文件
- `AGENTS.md` - 编译输出（自动生成）

### 规则文件命名

- 以 `_` 开头的文件是特殊文件（不参与构建）
- 规则文件格式：`area-description.md`（如 `async-parallel.md`）
- 分类根据文件名前缀自动推断
- 规则按标题字母顺序排序
- ID（如 1.1, 1.2）在构建时自动生成

### 区域前缀

| 前缀 | 分类 |
|------|------|
| `async-` | 消除瀑布流（Section 1）|
| `bundle-` | 包体积优化（Section 2）|
| `server-` | 服务端性能（Section 3）|
| `client-` | 客户端数据获取（Section 4）|
| `rerender-` | 重渲染优化（Section 5）|
| `rendering-` | 渲染性能（Section 6）|
| `js-` | JavaScript 性能（Section 7）|
| `advanced-` | 高级模式（Section 8）|

### 影响级别

- `CRITICAL` - 最高优先级，重大性能提升
- `HIGH` - 显著性能改进
- `MEDIUM-HIGH` - 中高收益
- `MEDIUM` - 中等性能改进
- `LOW-MEDIUM` - 低中收益
- `LOW` - 增量改进

## License

MIT
