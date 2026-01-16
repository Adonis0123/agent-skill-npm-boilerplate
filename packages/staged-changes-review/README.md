# @adonis0123/staged-changes-review

> Git 暂存变更的全面审查（风险评估、错误检测、影响分析）

[![npm version](https://img.shields.io/npm/v/@adonis0123/staged-changes-review.svg)](https://www.npmjs.com/package/@adonis0123/staged-changes-review)

## 安装

```bash
npm install -g @adonis0123/staged-changes-review
```

## 使用

在 Claude Code 中：

```
/staged-changes-review
```

或直接说：
- "审查暂存的代码"
- "检查我的变更"
- "review staged changes"

## 功能

- 自动获取 `git diff --cached` 内容
- 四维度全面分析：
  - 语法和编译错误
  - 逻辑和运行时错误
  - 破坏性变更和副作用
  - 安全漏洞
- 置信度评分系统（HIGH/MEDIUM/LOW）
- 生成结构化审查报告

## 审查流程

1. **获取暂存变更** - 读取 git diff 和文件列表
2. **多维度分析** - 从四个关键角度检查代码
3. **上下文检查** - 查看相关代码以确认问题
4. **置信度评分** - 对每个问题进行可信度评估
5. **生成报告** - 输出结构化的审查结果

## 输出示例

```markdown
## Staged Changes Review

### Summary
- **Files Changed**: 3
- **High Risk Issues**: 1
- **Medium Risk Issues**: 2
- **Security Concerns**: 0

### Critical Issues (Confidence >= 80)

#### 1. [Logic] Potential null pointer access
**File**: `src/utils.ts:42`
**Severity**: HIGH
**Confidence**: 95/100

**Problem**: Accessing property on potentially undefined object
**Impact**: Runtime crash when user data is missing
**Recommendation**: Add null check before accessing user.profile
```

## 更多技能

- [@adonis0123/weekly-report](https://www.npmjs.com/package/@adonis0123/weekly-report) - 周报生成
- [@adonis0123/agent-browser](https://www.npmjs.com/package/@adonis0123/agent-browser) - 浏览器自动化
- [@adonis0123/react-best-practices](https://www.npmjs.com/package/@adonis0123/react-best-practices) - React 最佳实践
- [@adonis0123/skill-development](https://www.npmjs.com/package/@adonis0123/skill-development) - 技能开发指南
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 提交信息生成
- [@adonis0123/create-skill](https://www.npmjs.com/package/@adonis0123/create-skill) - 创建新技能包
- [@adonis0123/code-doc-generator](https://www.npmjs.com/package/@adonis0123/code-doc-generator) - 代码文档生成
## License

MIT
