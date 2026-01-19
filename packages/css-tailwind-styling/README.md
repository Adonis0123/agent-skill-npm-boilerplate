# @adonis0123/css-tailwind-styling

> **Claude Code 技能** - CSS 和 Tailwind CSS 样式规范与最佳实践

专业的 CSS 和 Tailwind CSS 开发指南，涵盖现代样式技术、性能优化、响应式设计和团队协作标准。

## 功能特性

### 核心能力

- ✅ **Tailwind CSS 最佳实践** - 类排序、组件抽象、动态类处理
- ✅ **传统 CSS 规范** - BEM 命名、属性排序、选择器优化
- ✅ **响应式设计** - 移动优先策略、断点管理
- ✅ **性能优化** - 关键 CSS、代码分割、渲染优化
- ✅ **无障碍访问** - WCAG AA 合规、对比度检查、焦点管理
- ✅ **现代 CSS 特性** - 嵌套、容器查询、:has() 选择器

### 涵盖场景

- 创建或重构组件样式
- 建立项目样式架构
- 优化 CSS/Tailwind 性能
- 制定团队样式规范
- 代码审查和调试
- 实现响应式设计
- 确保无障碍合规

## 安装

```bash
npm install -g @adonis0123/css-tailwind-styling
```

## 使用方法

在 Claude Code 中使用以下触发词：

- "优化 Tailwind 类"
- "CSS 最佳实践"
- "响应式设计规范"
- "样式性能优化"
- "无障碍样式检查"

或直接调用技能：

```
/css-tailwind-styling
```

## 核心原则

1. **可维护性优先** - 编写易于理解和修改的样式
2. **性能导向** - 最小化包体积和渲染阻塞
3. **默认无障碍** - 确保 WCAG AA 合规（4.5:1 对比度）
4. **移动优先响应式** - 从移动端开始渐进增强
5. **一致性胜过技巧** - 建立并遵循模式

## 技能内容

### Tailwind CSS 指南

- 类排序规范（Concentric CSS 方法）
- 组件抽象策略（优先组件 > @apply）
- 动态类处理模式（避免字符串插值）
- 配置文件最佳实践
- 性能优化技巧

### 传统 CSS 指南

- 文件组织结构
- BEM/SMACSS 命名规范
- 属性排序（Concentric CSS）
- CSS 自定义属性（变量）
- 选择器最佳实践

### 响应式设计

- 移动优先断点策略
- Flexbox 和 Grid 布局
- 容器查询（2024+）
- 媒体查询最佳实践

### 性能优化

- 关键 CSS 内联
- 代码压缩和分割
- 昂贵属性识别
- will-change 使用规范

### 无障碍实践

- 色彩对比度检查（WCAG AA）
- 焦点指示器设计
- 屏幕阅读器支持
- 减少动画偏好

## 工具推荐

### 必备工具

- [Prettier + Tailwind Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) - 自动格式化类排序
- [ESLint + Tailwind Plugin](https://www.npmjs.com/package/eslint-plugin-tailwindcss) - Tailwind 类检查
- [Autoprefixer](https://github.com/postcss/autoprefixer) - 自动添加浏览器前缀
- [cssnano](https://cssnano.co/) - CSS 压缩

### 测试工具

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - 对比度检查
- [WAVE](https://wave.webaim.org/) - 无障碍测试
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - 性能和无障碍审计

## 快速参考

### Tailwind 检查清单

- [ ] 类排序规范（安装 Prettier 插件）
- [ ] 使用简写工具类（mx, py）
- [ ] 避免字符串插值生成类名
- [ ] 使用预定义变体而非任意类
- [ ] 配置文件设置设计令牌
- [ ] 正确配置 content 路径
- [ ] 安装 ESLint Tailwind 插件

### 提交前检查

- [ ] 移除未使用的 CSS（启用 JIT）
- [ ] 生产环境压缩
- [ ] 必要时内联关键 CSS
- [ ] 无障碍测试（键盘导航、屏幕阅读器）
- [ ] 多屏幕尺寸响应式测试
- [ ] 跨浏览器兼容性测试

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 提交信息生成
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 代码审查
- [@adonis0123/create-skill](https://www.npmjs.com/package/@adonis0123/create-skill) - 创建新技能包
- [@adonis0123/code-doc-generator](https://www.npmjs.com/package/@adonis0123/code-doc-generator) - 代码文档生成
- [@adonis0123/cli](https://www.npmjs.com/package/@adonis0123/cli) - CLI 工具
## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT © adonis
