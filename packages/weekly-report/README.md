# @adonis0123/weekly-report

> Claude Code 技能 - 自动读取 Git 提交记录生成周报

[![npm version](https://img.shields.io/npm/v/@adonis0123/weekly-report.svg)](https://www.npmjs.com/package/@adonis0123/weekly-report)

## 安装

```bash
npm install -g @adonis0123/weekly-report
```

## 使用

在任意 Git 项目目录中，对 Claude Code 说：

```
/weekly-report
```

## 功能

- 自动读取 Git 提交记录
- 支持多仓库汇总
- 智能过滤琐碎提交（typo、merge、format）
- 按项目分组生成结构化周报
- 灵活时间范围（本周、上周、自定义）
- 周报自动保存到 `~/.weekly-reports/`

## 输出示例

```markdown
# 周报 (2026-01-06 ~ 2026-01-12)

project-frontend
  - 构建工具升级改造
  - 核心功能开发流程跟进

project-backend
  - 自定义类型化消息渲染
  - 断线重连流程梳理
```

## 配置

配置文件：`~/.weekly-reports/config.json`

```json
{
  "repos": [
    { "name": "project-a", "path": "/path/to/project-a" }
  ]
}
```

## 更多技能

- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南

## License

MIT
