# @adonis0123/commit

Claude Code 技能 - 根据暂存的代码变更自动生成符合 Conventional Commits 规范的提交信息。

## 功能特性

- 自动分析 `git diff --cached` 内容
- 生成符合 Conventional Commits 规范的提交信息
- 自动添加对应的 emoji 前缀
- 支持中英文触发命令

## 安装

```bash
npm install -g @adonis0123/commit
```

安装后自动部署到 `~/.claude/skills/commit/`。

## 使用方法

在 Claude Code 中：

```
/commit
```

或直接说：
- "帮我生成提交信息"
- "提交代码"
- "generate commit message"

## 提交类型

| 类型 | Emoji | 说明 |
|------|-------|------|
| feat | ✨ | 新功能 |
| fix | 🐛 | Bug 修复 |
| docs | 📝 | 文档变更 |
| style | 🎨 | 代码风格 |
| refactor | ♻️ | 代码重构 |
| perf | ⚡️ | 性能优化 |
| test | ✅ | 测试相关 |
| build | 🏗️ | 构建系统 |
| ci | 👷 | CI 配置 |
| chore | 🔧 | 其他变更 |

## 示例输出

```
✨ feat(auth): add user login feature
🐛 fix(api): resolve timeout issue in payment endpoint
📝 docs: update README with installation guide
```

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 代码审查
- [@adonis0123/create-skill](https://www.npmjs.com/package/@adonis0123/create-skill) - 创建新技能包
- [@adonis0123/code-doc-generator](https://www.npmjs.com/package/@adonis0123/code-doc-generator) - 代码文档生成
- [@adonis0123/css-tailwind-styling](https://www.npmjs.com/package/@adonis0123/css-tailwind-styling) - CSS 和 Tailwind 样式规范
- [@adonis0123/zustand-store-scaffold](https://www.npmjs.com/package/@adonis0123/zustand-store-scaffold) - Zustand Store 脚手架生成器
## License

MIT
