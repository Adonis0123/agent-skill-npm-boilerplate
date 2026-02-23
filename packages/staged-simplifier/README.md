# @adonis0123/staged-simplifier

> ⚠️ **Deprecated**: All skills have moved to [adonis-skills.vercel.app](https://adonis-skills.vercel.app/). This repository is no longer maintained.


Apply code-simplifier principles to staged Git changes before commit.

专门针对 Git 暂存文件应用代码简化原则的技能，在提交前优化代码质量。

## Features

- 🎯 **Git-Aware**: 仅优化通过 `git add` 暂存的文件
- 🔍 **智能分析**: 识别深层嵌套、模糊命名、重复代码等问题
- 📋 **详细建议**: 提供前后对比和具体改进点
- ✅ **保持功能不变**: 仅优化代码质量，不改变业务逻辑
- 🚀 **提升提交质量**: 确保每次提交都是高质量的代码
- 🔗 **技能组合**: 与 staged-changes-review、commit 完美配合

## Installation

```bash
npm install -g @adonis0123/staged-simplifier
```

After installation, the skill will be automatically available in:
- Claude Code (`~/.claude/skills/staged-simplifier/`)
- Cursor (`~/.cursor/skills/staged-simplifier/`)

## Usage

### Basic Usage

```bash
# 1. 开发功能
vim src/feature.js

# 2. 暂存文件
git add src/feature.js

# 3. 优化暂存的代码
# 在 Claude Code 中运行:
/staged-simplifier

# 4. 应用优化建议并提交
/commit
git push
```

### Recommended Workflow

```bash
# 完整工作流
开发 → 测试 → git add → /staged-simplifier → /staged-changes-review → /commit → git push
```

### Quick Example

**Before optimization** (`src/utils/validation.js`):
```javascript
function validateUser(user) {
  if (user) {
    if (user.email) {
      if (user.email.includes('@')) {
        if (user.age >= 18) {
          return true;
        }
      }
    }
  }
  return false;
}
```

**After running `/staged-simplifier`**:
```javascript
function validateUser(user) {
  if (!user || !user.email) return false;
  if (!user.email.includes('@')) return false;
  return user.age >= 18;
}
```

**Improvements**:
- ✅ Reduced nesting from 4 levels to 1 level
- ✅ Used guard clauses for early returns
- ✅ Improved readability
- ✅ Maintained identical functionality

## When to Use

### ✅ Recommended Scenarios

- After `git add`, before `git commit`
- Bug fixes that need code cleanup
- Refactoring legacy code
- Before creating Pull Requests
- Team collaboration with coding standards

### ❌ Not Recommended

- No staged files (use `/code-simplifier` instead)
- Not in a Git repository (use `/code-simplifier` instead)
- Too many staged files (>20 files, split into batches)
- Auto-generated files (add to `.gitignore`)

## Core Principles

Based on code-simplifier's 5 core principles:

1. **保持功能不变**: Only optimize code quality, don't change business logic
2. **应用项目标准**: Follow project's coding standards (CLAUDE.md)
3. **增强清晰度**: Use meaningful names, reduce nesting, eliminate redundancy
4. **保持平衡**: Avoid over-engineering
5. **聚焦范围**: Only optimize staged files

## How It Works (Reuse code-simplifier)

`staged-simplifier` is built on top of `code-simplifier`.

During installation, it will:

1. Install `@adonis0123/code-simplifier` as a dependency (so you will see **both** skills installed)
2. Prefer reusing the locally installed `code-simplifier/SKILL.md` as the base (so it follows upstream updates)
3. Generate `staged-simplifier/SKILL.md` by applying staged-specific additions, and copy `code-simplifier` references into `references/code-simplifier/`

This avoids keeping a duplicated full copy of `code-simplifier` documentation inside this package.

Note: since both skills can register Claude hooks, you may see duplicated “run skill” hints. This is safe and does not affect functionality.

## Skill Comparison

| Skill | Target Files | Purpose | When to Use |
|-------|-------------|---------|-------------|
| **code-simplifier** | Any code files | General code quality optimization | Anytime during development |
| **staged-simplifier** | Git staged files | Pre-commit code optimization | After `git add`, before `git commit` |
| **staged-changes-review** | Git staged files | Risk assessment and error detection | After `git add`, before `git commit` |
| **commit** | Git staged files | Generate conventional commit messages | Ready to commit |

## What Gets Optimized

### Common Issues Detected

1. **Deep nesting** (>3 levels)
2. **Complex ternary expressions**
3. **Unclear variable names**
4. **Duplicate code logic**
5. **Overly long functions** (>50 lines)
6. **Inconsistent code style**

### Example Optimizations

#### Deep Nesting → Guard Clauses
```javascript
// Before
if (user) {
  if (user.isActive) {
    if (user.role === 'admin') {
      return performAction();
    }
  }
}
return null;

// After
if (!user || !user.isActive) return null;
if (user.role !== 'admin') return null;
return performAction();
```

#### Complex Ternary → Clear Function
```javascript
// Before
const status = user ? (user.isPremium ? (user.isActive ? 'active-premium' : 'inactive-premium') : 'basic') : 'unknown';

// After
function getUserStatus(user) {
  if (!user) return 'unknown';
  if (!user.isPremium) return 'basic';
  return user.isActive ? 'active-premium' : 'inactive-premium';
}
const status = getUserStatus(user);
```

#### Unclear Naming → Meaningful Names
```javascript
// Before
const d = new Date();
const x = data.filter(i => i.a > 5);

// After
const currentDate = new Date();
const activeItems = data.filter(item => item.age > 5);
```

## Integration with Other Skills

### With `/commit`
```bash
git add .
/staged-simplifier  # Optimize code quality
/commit             # Generate commit message
git push
```

### With `/staged-changes-review` + `/commit`
```bash
git add .
/staged-simplifier        # Optimize code quality
/staged-changes-review    # Check for risks
/commit                   # Generate commit message
git push
```

### With `/code-simplifier`
```bash
# Step 1: Full file optimization
/code-simplifier src/legacy.js

# Step 2: Stage and optimize for commit
git add src/legacy.js
/staged-simplifier

# Step 3: Commit
/commit
```

## Performance Tips

### For Many Files (>10)

Split into batches:
```bash
# Batch 1: Core files
git add src/core/*.js
/staged-simplifier
/commit

# Batch 2: Utilities
git add src/utils/*.js
/staged-simplifier
/commit
```

### For Large Files (>500 lines)

Focus on modified sections:
```bash
# View modified lines
git diff --cached src/large-file.js

# In Claude Code, specify:
# "Only optimize lines 450-520 in src/large-file.js"
```

### Priority Filtering

Focus on high-priority issues:
```
用户: /staged-simplifier，仅显示高优先级问题

Claude: [Shows only high-priority issues like deep nesting, security risks]
```

## Auto-Trigger Keywords

This skill automatically activates when you mention:

- "优化暂存的代码"、"简化暂存文件"
- "提交前重构"、"优化即将提交的代码"
- "清理暂存区的代码"、"提升提交质量"
- Explicit command: `/staged-simplifier`

## Git Commands Used

```bash
# Check staged files
git status --short | grep "^[MARC]"
git diff --cached --name-only

# View staged changes
git diff --cached

# Unstage if needed
git restore --staged <file>
```

## Project Standards Integration

staged-simplifier automatically reads your project's `CLAUDE.md` for coding standards.

**Example** (`CLAUDE.md`):
```markdown
# Coding Standards

- Use ESLint (Airbnb style)
- Max function length: 50 lines
- Use const/let, no var
- Prefer arrow functions
```

staged-simplifier will ensure optimizations follow these standards.

## CI/CD Integration

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "💡 建议运行: /staged-simplifier 优化代码质量"
echo "按 Enter 继续提交，Ctrl+C 取消并优化..."
read
```

### GitHub Actions

```yaml
# .github/workflows/code-quality.yml
- name: Comment on PR
  run: |
    echo "💡 Tip: Run /staged-simplifier before committing"
```

## Additional Resources

The skill package includes supplementary resources in the `references/` directory:

- **workflow-examples.md**: Complete workflow examples and use cases
- **best-practices.md**: Best practices and performance optimization tips

## Error Handling

### No Staged Files
```
❌ 错误: 当前没有暂存的文件
请先使用: git add <file>
或使用: /code-simplifier 优化任意代码文件
```

### Not a Git Repository
```
❌ 错误: 当前目录不是 Git 仓库
请使用: /code-simplifier 优化任意代码文件
或初始化: git init
```

### No Code Files
```
⚠️ 警告: 暂存的文件中没有代码文件
此技能仅优化代码文件（.js, .ts, .py, .go, .java, .rs 等）
```

## Examples

See `references/workflow-examples.md` for detailed examples including:

- Single file optimization
- Multiple file batch optimization
- Team collaboration workflow
- CI/CD integration
- Pre-commit hook setup

## Requirements

- Git repository
- At least one staged file (`git add` executed)
- Code files (not binary files)

## Related Skills

- [@adonis0123/code-simplifier](https://www.npmjs.com/package/@adonis0123/code-simplifier) - General code quality optimization
- [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - Risk assessment for staged files
- [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - Generate conventional commit messages

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
- [@adonis0123/zustand-store-scaffold](https://www.npmjs.com/package/@adonis0123/zustand-store-scaffold) - Zustand Store 脚手架生成器
## License

MIT

## Author

adonis

## Repository

https://github.com/adonis0123/claude-skills/tree/main/packages/staged-simplifier

## Issues

https://github.com/adonis0123/claude-skills/issues

## Changelog

### 1.0.0 (2026-01-27)

- Initial release
- Git-aware code optimization
- Integration with staged-changes-review and commit skills
- Comprehensive workflow examples and best practices
