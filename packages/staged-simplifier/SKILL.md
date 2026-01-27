---
name: staged-simplifier
description: Apply code-simplifier principles to staged Git changes before commit. Use when the user wants to optimize staged code, simplify staged files, refactor before commit, or clean up code quality issues in staged changes.
version: 1.0.0
---

# Staged Simplifier

专门针对 Git 暂存文件应用代码简化原则的技能，在提交前优化代码质量。

## 输出要求 / Output Requirements

**重要：本技能必须使用中文输出所有分析结果和建议。**

- **语言 (Language)**: 始终使用中文回复
- **编码 (Encoding)**: 使用 UTF-8 编码
- **风格 (Style)**: 专业、详细、实用，提供具体的代码示例和修改建议

## 概述

Staged Simplifier 是 code-simplifier 的 Git-aware 版本，专注于优化**已暂存但未提交**的代码文件。它确保每次提交都包含高质量、易维护的代码。

### 与其他技能的区别

| 技能 | 作用对象 | 主要用途 | 使用时机 |
|------|---------|---------|---------|
| **code-simplifier** | 任意代码文件 | 通用代码质量优化 | 开发过程中任何时候 |
| **staged-simplifier** | Git 暂存文件 | 提交前代码优化 | `git add` 之后，`git commit` 之前 |
| **staged-changes-review** | Git 暂存文件 | 风险评估和错误检测 | `git add` 之后，`git commit` 之前 |
| **commit** | Git 暂存文件 | 生成规范提交信息 | `git add` 之后，准备提交时 |

## 使用场景

此技能适用于以下情况：

- ✅ 已通过 `git add` 暂存文件，准备提交
- ✅ 想要在提交前确保代码质量
- ✅ 希望逐步优化代码，每次提交都是高质量的
- ✅ 团队要求严格的代码审查标准
- ✅ 在 CI/CD 流程中集成代码质量检查

**不适用场景**：

- ❌ 没有暂存任何文件（请先 `git add`，或使用 `/code-simplifier`）
- ❌ 不在 Git 仓库中（请使用 `/code-simplifier`）
- ❌ 只想审查风险而不修改代码（请使用 `/staged-changes-review`）

## 前置条件

- 当前目录是 Git 仓库
- 至少有一个文件通过 `git add` 暂存
- 暂存的文件包含代码文件（非二进制文件）

## 6 步工作流程

### 步骤 1: 获取暂存文件列表

使用 Git 命令获取所有暂存的文件：

```bash
# 获取暂存文件列表（简短格式）
git status --short | grep "^[MARC]"

# 获取暂存文件的完整路径
git diff --cached --name-only
```

**输出示例**：
```
M  src/utils/validation.js
A  src/components/UserCard.tsx
M  src/services/api.ts
```

**处理逻辑**：
- 如果没有暂存文件，友好提示用户先运行 `git add`
- 过滤非代码文件（如 .png, .jpg, .pdf 等）
- 仅处理代码文件（.js, .ts, .jsx, .tsx, .py, .go, .java, .rs 等）

### 步骤 2: 读取暂存文件内容

使用 Read 工具逐个读取暂存文件的当前内容：

```markdown
Read 工具参数:
- file_path: 暂存文件的绝对路径
```

**注意事项**：
- 读取的是工作目录的文件内容（已暂存的版本）
- 如果文件过大（>500 行），可以分段读取
- 记录文件的编程语言，以便应用对应的最佳实践

### 步骤 3: 应用 5 个核心原则

基于 code-simplifier 的核心原则，针对暂存场景进行特化：

#### 3.1 保持功能不变（来自 code-simplifier）

- 仅优化代码质量，不改变业务逻辑
- **暂存场景特化**: 确保优化后可以安全提交，不会破坏现有功能

#### 3.2 应用项目标准（来自 code-simplifier）

- 参考项目 `CLAUDE.md` 中的编码规范
- **暂存场景特化**: 检查是否符合团队的提交标准（如 ESLint、Prettier 配置）

#### 3.3 增强清晰度（来自 code-simplifier）

- 使用有意义的变量名和函数名
- 减少嵌套层级，使用 guard clauses
- 消除冗余代码和不必要的复杂性
- **暂存场景特化**: 优先处理即将提交的代码，确保代码审查时易于理解

#### 3.4 保持平衡（来自 code-simplifier）

- 避免过度工程化
- 不为微小的可读性提升牺牲显著性能
- **暂存场景特化**: 仅优化暂存的文件，不主动扩展到其他文件

#### 3.5 聚焦范围（来自 code-simplifier）

- 仅优化明确指定的代码部分
- **暂存场景特化**: **严格限制在 `git add` 的文件范围内**，不修改未暂存的文件

### 步骤 4: 识别优化点

扫描暂存文件，查找以下常见问题：

#### 4.1 深层嵌套

**问题示例**：
```javascript
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.role === 'admin') {
        return performAdminAction(user);
      }
    }
  }
  return null;
}
```

**优化建议**：
```javascript
function processUser(user) {
  if (!user || !user.isActive) return null;
  if (user.role !== 'admin') return null;
  return performAdminAction(user);
}
```

#### 4.2 复杂三元表达式

**问题示例**：
```javascript
const status = user ? (user.isPremium ? (user.isActive ? 'active-premium' : 'inactive-premium') : 'basic') : 'unknown';
```

**优化建议**：
```javascript
function getUserStatus(user) {
  if (!user) return 'unknown';
  if (!user.isPremium) return 'basic';
  return user.isActive ? 'active-premium' : 'inactive-premium';
}
const status = getUserStatus(user);
```

#### 4.3 模糊的变量命名

**问题示例**：
```typescript
const d = new Date();
const x = data.filter(i => i.a > 5);
```

**优化建议**：
```typescript
const currentDate = new Date();
const activeItems = data.filter(item => item.age > 5);
```

#### 4.4 重复代码逻辑

**问题示例**：
```python
def get_user_email(user_id):
    user = db.query(User).filter(User.id == user_id).first()
    return user.email if user else None

def get_user_name(user_id):
    user = db.query(User).filter(User.id == user_id).first()
    return user.name if user else None
```

**优化建议**：
```python
def get_user_by_id(user_id):
    return db.query(User).filter(User.id == user_id).first()

def get_user_email(user_id):
    user = get_user_by_id(user_id)
    return user.email if user else None

def get_user_name(user_id):
    user = get_user_by_id(user_id)
    return user.name if user else None
```

#### 4.5 过长函数

**问题示例**：
- 函数超过 50 行
- 承担多个职责

**优化建议**：
- 提取子函数
- 应用单一职责原则

#### 4.6 不一致的代码风格

**问题示例**：
- 混用单引号和双引号
- 不一致的缩进
- 混用 function 和箭头函数

**优化建议**：
- 遵循项目的 ESLint/Prettier 配置
- 统一代码风格

### 步骤 5: 生成优化建议

按文件分组展示问题和建议：

```markdown
## 暂存文件优化建议

### 概览
- **暂存文件数量**: <count>
- **需要优化的文件**: <count>
- **发现的问题**: <count>
- **优先级**: 高 (<count>) | 中 (<count>) | 低 (<count>)

### 优化详情

#### 📄 文件: `src/utils/validation.js`

**问题 1: 深层嵌套 (优先级: 高)**
- **位置**: 第 12-24 行
- **问题描述**: 4 层嵌套的 if 语句，难以阅读和维护
- **当前代码**:
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

- **优化后代码**:
```javascript
function validateUser(user) {
  if (!user || !user.email) return false;
  if (!user.email.includes('@')) return false;
  return user.age >= 18;
}
```

- **改进点**:
  - 使用 guard clauses 减少嵌套
  - 提升可读性
  - 保持功能完全一致

---

#### 📄 文件: `src/components/UserCard.tsx`

**问题 2: 模糊的变量命名 (优先级: 中)**
- **位置**: 第 8-15 行
- **问题描述**: 变量名 `d`, `x`, `y` 无法表达含义
- **当前代码**:
```typescript
const d = new Date();
const x = users.filter(u => u.active);
const y = x.length;
```

- **优化后代码**:
```typescript
const currentDate = new Date();
const activeUsers = users.filter(user => user.active);
const activeUserCount = activeUsers.length;
```

- **改进点**:
  - 使用有意义的变量名
  - 提升代码自文档性
```

### 步骤 6: 实施优化

用户确认后，使用 Edit 工具逐个修改文件：

```markdown
Edit 工具参数:
- file_path: 要修改的文件路径
- old_string: 当前代码（从 Read 工具获取）
- new_string: 优化后的代码
```

**重要注意事项**：
- ✅ 修改后文件仍保持暂存状态（Git staging area 不变）
- ✅ 逐个文件、逐个问题修改，不一次性修改所有内容
- ✅ 修改后建议用户运行测试验证功能
- ✅ 如果用户有疑虑，提供详细解释

## 推荐工作流

```bash
# 1. 开发功能
vim src/feature.js

# 2. 运行测试
npm test

# 3. 暂存文件
git add src/feature.js

# 4. 优化暂存的代码（使用此技能）
# 在 Claude Code 中运行 /staged-simplifier

# 5. 检查暂存文件的风险（可选）
# 在 Claude Code 中运行 /staged-changes-review

# 6. 生成提交信息
# 在 Claude Code 中运行 /commit

# 7. 推送到远程仓库
git push
```

## 性能优化建议

### 处理大量文件

如果暂存文件超过 10 个，建议：

1. **分批暂存和优化**
   ```bash
   # 仅暂存相关文件
   git add src/feature1.js src/feature2.js
   # 运行 /staged-simplifier

   # 然后暂存其他文件
   git add src/feature3.js src/feature4.js
   # 再次运行 /staged-simplifier
   ```

2. **优先处理高优先级问题**
   - 先修复语法错误和安全问题
   - 再处理代码风格和命名问题

3. **跳过自动生成的文件**
   - package-lock.json
   - yarn.lock
   - dist/、build/ 目录下的文件

### 处理大文件

如果单个文件超过 500 行：

1. **分段读取**
   ```markdown
   Read 工具参数:
   - file_path: 文件路径
   - offset: 起始行号
   - limit: 读取行数
   ```

2. **仅优化修改的部分**
   - 使用 `git diff --cached` 查看具体修改的行
   - 仅优化修改附近的代码

## 自动触发条件

此技能会在以下情况自动激活：

- 用户提到"优化暂存的代码"、"简化暂存文件"
- 用户询问"提交前重构"、"优化即将提交的代码"
- 用户请求"清理暂存区的代码"、"提升提交质量"
- 明确调用 `/staged-simplifier` 命令

## Git 命令使用指南

### 检查暂存状态

```bash
# 查看暂存文件列表
git status --short | grep "^[MARC]"

# 查看暂存文件的完整路径
git diff --cached --name-only

# 查看暂存文件的具体改动
git diff --cached
```

### 暂存状态说明

| 状态 | 含义 | 示例 |
|------|------|------|
| M | Modified（已修改） | `M  src/app.js` |
| A | Added（新增） | `A  src/new.js` |
| R | Renamed（重命名） | `R  old.js -> new.js` |
| C | Copied（复制） | `C  src/original.js -> src/copy.js` |

### 取消暂存（如果需要）

```bash
# 取消暂存单个文件
git restore --staged <file>

# 取消暂存所有文件
git restore --staged .
```

## 错误处理

### 场景 1: 没有暂存文件

**输出**：
```
❌ 错误: 当前没有暂存的文件

请先使用以下命令暂存文件：
  git add <file>        # 暂存单个文件
  git add .             # 暂存所有修改

或者使用 /code-simplifier 优化任意代码文件。
```

### 场景 2: 不在 Git 仓库中

**输出**：
```
❌ 错误: 当前目录不是 Git 仓库

请在 Git 仓库中使用此技能，或使用 /code-simplifier 优化任意代码文件。

初始化 Git 仓库：
  git init
```

### 场景 3: 暂存的都是非代码文件

**输出**：
```
⚠️ 警告: 暂存的文件中没有代码文件

暂存文件列表:
  - image.png
  - document.pdf

此技能仅优化代码文件（.js, .ts, .py, .go, .java, .rs 等）。
```

## 与 CI/CD 集成

### Pre-commit Hook 集成

可以将此技能集成到 Git pre-commit hook 中：

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running staged-simplifier..."

# 检查是否安装 Claude Code
if ! command -v claude &> /dev/null; then
    echo "⚠️ Claude Code not found, skipping code simplification"
    exit 0
fi

# 提示用户运行 /staged-simplifier
echo "💡 建议在提交前运行: /staged-simplifier"
echo "💡 按 Enter 继续提交，Ctrl+C 取消"
read

exit 0
```

### GitHub Actions 集成

在 PR 中自动运行代码质量检查：

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check

on:
  pull_request:
    branches: [ main ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run ESLint
        run: npm run lint

      - name: Comment on PR
        run: |
          echo "💡 Tip: Run /staged-simplifier before committing for better code quality"
```

## 参考资源

技能包提供以下补充资源（位于 `references/` 目录）：

1. **workflow-examples.md**: 完整工作流示例和集成案例
2. **best-practices.md**: 使用最佳实践和性能优化建议

## 许可

此技能基于 code-simplifier 的核心原则，专为 Git 暂存场景优化。

## 更多信息

- 包主页: [@adonis0123/staged-simplifier](https://www.npmjs.com/package/@adonis0123/staged-simplifier)
- 相关技能:
  - [@adonis0123/code-simplifier](https://www.npmjs.com/package/@adonis0123/code-simplifier) - 通用代码质量优化
  - [@adonis0123/staged-changes-review](https://www.npmjs.com/package/@adonis0123/staged-changes-review) - 暂存文件风险评估
  - [@adonis0123/commit](https://www.npmjs.com/package/@adonis0123/commit) - 生成规范提交信息
