# @adonis0123/create-skill

项目专属的 Skill 创建工具，用于快速创建新的 Claude Code skill npm 包。

> ⚠️ 这是一个私有包，不会发布到 npm，仅供本项目内部使用。

## 安装方式

克隆项目后，运行以下命令完成初始化：

```bash
pnpm setup
```

这个命令会自动执行：
1. `pnpm install` - 安装依赖
2. `pnpm sync` - 同步共享脚本
3. 安装 create-skill 到项目

## 安装位置

安装后，技能文件会被复制到：

- **Claude Code**: `.claude/skills/create-skill/`
- **Cursor**: `.cursor/skills/create-skill/`

## 使用方式

在 Claude Code 中，使用以下方式触发此技能：

- 输入 `/create-skill`
- 或说 "创建一个新的 skill 包"
- 或说 "add a new skill package"

## 技能功能

此技能提供：

1. **创建流程指南** - 6 步完成新 skill 包创建
2. **配置模板** - `.claude-skill.json`、`package.json`、`SKILL.md` 模板
3. **检查清单** - 验证每个步骤的完成情况
4. **两种模式说明** - Local（本地）和 Remote（远程同步）模式

## 文件结构

```
packages/create-skill/
├── package.json           # private: true，不发布
├── .claude-skill.json     # 技能配置
├── SKILL.md               # 技能主文件
├── references/
│   ├── templates.md       # 配置文件模板
│   └── checklist.md       # 创建检查清单
├── install-skill.js       # 安装脚本（自动生成）
└── uninstall-skill.js     # 卸载脚本（自动生成）
```

## 卸载

```bash
node packages/create-skill/uninstall-skill.js
```

## 更新

修改 `SKILL.md` 或 `references/` 内容后，重新运行安装命令：

```bash
node packages/create-skill/install-skill.js
```

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 提交信息生成
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 代码审查
- [@adonis0123/code-doc-generator](https://www.npmjs.com/package/@adonis0123/code-doc-generator) - 代码文档生成
