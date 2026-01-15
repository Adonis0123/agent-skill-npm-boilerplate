# Claude Skills

> 一系列 Claude Code 技能的 npm 包，可按需安装

## 可用技能

| 包名 | 描述 | 安装命令 |
|------|------|----------|
| [@adonis0123/weekly-report](./packages/weekly-report) | 自动读取 Git 提交记录生成周报 | `npm i -g @adonis0123/weekly-report` |
| [@adonis0123/agent-browser](./packages/agent-browser) | 浏览器自动化（测试、截图、数据提取） | `npm i -g @adonis0123/agent-browser` |
| [@adonis0123/react-best-practices](./packages/react-best-practices) | React/Next.js 性能优化最佳实践 | `npm i -g @adonis0123/react-best-practices` |

## 安装

```bash
# 按需安装单个技能
npm install -g @adonis0123/weekly-report

# 或一次安装全部
npm install -g @adonis0123/weekly-report @adonis0123/agent-browser @adonis0123/react-best-practices
```

安装后技能会自动部署到 `~/.claude/skills/`，在 Claude Code 中即可使用。

## 使用

在 Claude Code 中：

```
/weekly-report          # 生成周报
/agent-browser          # 浏览器自动化
/react-best-practices   # React 最佳实践指导
```

## 更新

```bash
npm update -g @adonis0123/weekly-report
```

## 卸载

```bash
npm uninstall -g @adonis0123/weekly-report
```

## 技能详情

### weekly-report

自动读取 Git 提交记录，按项目分组生成结构化周报。

- 支持多仓库汇总
- 智能过滤琐碎提交（typo、merge、format）
- 灵活时间范围（本周、上周、自定义）

### agent-browser

基于 Playwright 的浏览器自动化工具。

- 网页导航和交互
- 表单填写
- 截图
- 数据提取

### react-best-practices

来自 Vercel Engineering 的 React/Next.js 性能优化指南。

- 45 条优化规则
- 8 个优先级分类
- 详细代码示例

## License

MIT
