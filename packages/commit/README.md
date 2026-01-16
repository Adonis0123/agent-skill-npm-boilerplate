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

## License

MIT
