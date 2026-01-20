# @adonis0123/spec-flow

Claude Code 技能 - 结构化、规范驱动的开发工作流，具备实时文档生成功能

## 功能特性

- **阶段化工作流**：将开发组织为四个连续阶段 - 提案、需求、设计和任务
- **交互式确认**：每个阶段需要用户批准后才能进入下一阶段
- **实时文档**：在 `.spec-flow/` 目录中生成 Markdown 文件，记录开发过程
- **EARS 需求格式**：实现行业标准的需求语法（Easy Approach to Requirements Syntax）
- **灵活执行模式**：支持步进模式（一次一个任务）、批处理模式（连续执行）和基于阶段的执行
- **团队协作**：Git 兼容的结构设计，便于跨团队共享规范

## 安装

```bash
npm install -g @adonis0123/spec-flow
```

## 使用方法

在 Claude Code 中使用以下触发词：
- `/spec-flow`
- "need a plan"
- "create specification"
- "structured development"

该技能会引导你完成：
1. **提案阶段**：定义功能概述和目标
2. **需求阶段**：使用 EARS 格式编写详细需求
3. **设计阶段**：创建技术设计和架构决策
4. **任务阶段**：分解为可执行的开发任务

## 执行模式

- **Step 模式**：一次执行一个任务，每次需要确认
- **Batch 模式**：连续执行多个任务
- **Phase 模式**：按阶段批量执行

## 上游来源

本包会在安装时从 [echoVic/spec-flow](https://github.com/echoVic/spec-flow) 获取最新内容。

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

---

> 该技能包采用远程模式，会在安装时自动从上游仓库同步最新内容。
