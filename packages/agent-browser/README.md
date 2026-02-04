# @adonis0123/agent-browser

> Claude Code 技能 - 浏览器自动化（网页测试、表单填写、截图、数据提取）

[![npm version](https://img.shields.io/npm/v/@adonis0123/agent-browser.svg)](https://www.npmjs.com/package/@adonis0123/agent-browser)

## 安装

```bash
npm install -g @adonis0123/agent-browser
```

## 使用

在 Claude Code 中使用浏览器自动化命令：

```bash
agent-browser open <url>        # 打开网页
agent-browser snapshot -i       # 获取可交互元素
agent-browser click @e1         # 点击元素
agent-browser fill @e2 "text"   # 填写表单
agent-browser screenshot        # 截图
agent-browser close             # 关闭浏览器
```

## 核心功能

### 导航
```bash
agent-browser open https://example.com
agent-browser back / forward / reload
```

### 交互
```bash
agent-browser click @e1           # 点击
agent-browser fill @e2 "text"     # 填写
agent-browser press Enter         # 按键
agent-browser select @e1 "value"  # 下拉选择
```

### 获取信息
```bash
agent-browser get text @e1        # 获取文本
agent-browser get url             # 获取当前 URL
agent-browser screenshot path.png # 保存截图
```

### 等待
```bash
agent-browser wait @e1            # 等待元素
agent-browser wait 2000           # 等待毫秒
agent-browser wait --text "Done"  # 等待文本出现
```

## 示例：表单提交

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
```

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 提交信息生成
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 代码审查
- [@adonis0123/create-skill](https://www.npmjs.com/package/@adonis0123/create-skill) - 创建新技能包
- [@adonis0123/code-doc-generator](https://www.npmjs.com/package/@adonis0123/code-doc-generator) - 代码文档生成
- [@adonis0123/css-tailwind-styling](https://www.npmjs.com/package/@adonis0123/css-tailwind-styling) - CSS 和 Tailwind 样式规范
- [@adonis0123/zustand-store-scaffold](https://www.npmjs.com/package/@adonis0123/zustand-store-scaffold) - Zustand Store 脚手架生成器
## License

MIT
