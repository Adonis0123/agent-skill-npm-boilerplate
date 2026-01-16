# @adonis0123/skill-development

> Claude Code 技能 - 官方技能开发指南（来自 Anthropic）

[![npm version](https://img.shields.io/npm/v/@adonis0123/skill-development.svg)](https://www.npmjs.com/package/@adonis0123/skill-development)

**原始项目**: [anthropics/claude-code/plugins/plugin-dev/skills/skill-development](https://github.com/anthropics/claude-code/tree/main/plugins/plugin-dev/skills/skill-development)

## 安装

```bash
npm install -g @adonis0123/skill-development
```

## 使用

在 Claude Code 中使用：

```
/skill-development
```

或说 "创建一个新的 skill"、"如何开发技能" 等触发此技能。

## 功能

- 技能结构和设计原则（Progressive Disclosure）
- 创建技能的完整流程（6 步骤）
- 最佳实践和验证清单
- **安装时自动从上游仓库拉取最新版本**

## 核心概念

### 技能结构

```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter (name, description)
│   └── Markdown 指令
└── Bundled Resources (可选)
    ├── scripts/      - 可执行脚本
    ├── references/   - 参考文档
    └── assets/       - 模板、图片等
```

### Progressive Disclosure

技能使用三级加载系统高效管理上下文：

1. **元数据** - 始终在上下文中（~100 词）
2. **SKILL.md 主体** - 技能触发时加载（<5k 词）
3. **Bundled Resources** - 按需加载（无限制）

### 创建流程

1. 理解技能的具体使用场景
2. 规划可复用的技能内容
3. 初始化技能结构
4. 编辑 SKILL.md 和资源文件
5. 打包和验证
6. 迭代改进

## 写作风格要求

- 使用**祈使句**（如 "创建文件" 而非 "你应该创建"）
- 描述使用**第三人称**（如 "This skill should be used when..."）
- SKILL.md 主体保持在 2,000 词以内
- 详细内容移至 `references/` 文件

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 提交信息生成
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 代码审查
- [@adonis0123/create-skill](https://www.npmjs.com/package/@adonis0123/create-skill) - 创建新技能包

## License

MIT
