# Workflow Examples

完整的工作流示例和集成案例

## 目录

- [基础工作流](#基础工作流)
- [单文件优化示例](#单文件优化示例)
- [多文件批量优化](#多文件批量优化)
- [团队协作工作流](#团队协作工作流)
- [CI/CD 集成](#cicd-集成)

---

## 基础工作流

### 示例 1: 功能开发 → 优化 → 提交

```bash
# 1. 开发新功能
$ vim src/features/user-profile.js

# 2. 运行本地测试
$ npm test

# 3. 暂存修改的文件
$ git add src/features/user-profile.js

# 4. 优化暂存的代码
# 在 Claude Code 中运行:
/staged-simplifier

# 5. 检查优化建议并确认应用

# 6. 生成提交信息
# 在 Claude Code 中运行:
/commit

# 7. 推送到远程
$ git push origin feature/user-profile
```

**预期输出**:
```
💡 代码已修改，暂存后可运行: /staged-simplifier 优化提交内容

## 暂存文件优化建议

### 概览
- 暂存文件数量: 1
- 需要优化的文件: 1
- 发现的问题: 3
- 优先级: 高 (1) | 中 (2) | 低 (0)

### 优化详情

#### 📄 文件: `src/features/user-profile.js`

**问题 1: 深层嵌套 (优先级: 高)**
[详细建议...]

**问题 2: 模糊的变量命名 (优先级: 中)**
[详细建议...]

**问题 3: 重复代码逻辑 (优先级: 中)**
[详细建议...]
```

---

## 单文件优化示例

### 示例 2: 优化深层嵌套的验证逻辑

**初始代码** (`src/utils/validation.js`):
```javascript
function validateUserRegistration(data) {
  if (data) {
    if (data.username) {
      if (data.username.length >= 3) {
        if (data.email) {
          if (data.email.includes('@')) {
            if (data.password) {
              if (data.password.length >= 8) {
                if (data.age) {
                  if (data.age >= 18) {
                    return { valid: true };
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return { valid: false, error: 'Invalid registration data' };
}
```

**操作步骤**:
```bash
# 1. 暂存文件
$ git add src/utils/validation.js

# 2. 在 Claude Code 中运行
/staged-simplifier
```

**staged-simplifier 输出**:
```markdown
## 暂存文件优化建议

#### 📄 文件: `src/utils/validation.js`

**问题 1: 深层嵌套 (优先级: 高)**
- **位置**: 第 1-20 行
- **问题描述**: 9 层嵌套的 if 语句，极难阅读和维护
- **影响**: 代码审查困难，容易引入 bug

**优化后代码**:
```javascript
function validateUserRegistration(data) {
  // Guard clauses for early returns
  if (!data) {
    return { valid: false, error: 'Invalid registration data' };
  }

  if (!data.username || data.username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (!data.email || !data.email.includes('@')) {
    return { valid: false, error: 'Invalid email address' };
  }

  if (!data.password || data.password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (!data.age || data.age < 18) {
    return { valid: false, error: 'User must be at least 18 years old' };
  }

  return { valid: true };
}
```

**改进点**:
- ✅ 使用 guard clauses 减少嵌套层级（从 9 层降到 1 层）
- ✅ 每个验证都有明确的错误信息
- ✅ 代码可读性大幅提升
- ✅ 保持功能完全一致
```

**应用优化后**:
```bash
# 3. 确认应用优化
# staged-simplifier 使用 Edit 工具修改文件

# 4. 验证修改
$ npm test

# 5. 生成提交信息
/commit
```

**提交信息示例**:
```
refactor(validation): simplify user registration validation logic

- Reduce nesting from 9 levels to 1 using guard clauses
- Add specific error messages for each validation step
- Improve code readability and maintainability

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 多文件批量优化

### 示例 3: 重构用户管理模块

**场景**: 同时修改了多个相关文件，需要在提交前统一优化代码质量。

**文件列表**:
- `src/services/user-service.js` (150 行)
- `src/models/user.js` (80 行)
- `src/controllers/user-controller.js` (200 行)
- `src/utils/user-helpers.js` (120 行)

**操作步骤**:

```bash
# 1. 暂存所有修改的文件
$ git add src/services/user-service.js \
         src/models/user.js \
         src/controllers/user-controller.js \
         src/utils/user-helpers.js

# 2. 检查暂存状态
$ git status --short
M  src/services/user-service.js
M  src/models/user.js
M  src/controllers/user-controller.js
A  src/utils/user-helpers.js

# 3. 在 Claude Code 中运行
/staged-simplifier
```

**staged-simplifier 输出**:
```markdown
## 暂存文件优化建议

### 概览
- 暂存文件数量: 4
- 需要优化的文件: 4
- 发现的问题: 12
- 优先级: 高 (4) | 中 (6) | 低 (2)

### 优化详情

#### 📄 文件: `src/services/user-service.js` (3 个问题)

**问题 1: 过长函数 (优先级: 高)**
- **位置**: 第 45-120 行 (75 行)
- **问题描述**: `updateUserProfile` 函数过长，承担多个职责
- **建议**: 提取子函数 `validateProfileData`, `updateDatabase`, `sendNotification`

**问题 2: 重复代码逻辑 (优先级: 中)**
- **位置**: 第 25-35 行, 第 85-95 行
- **问题描述**: 相同的用户权限检查逻辑出现两次
- **建议**: 提取为 `checkUserPermission(user, permission)` 函数

---

#### 📄 文件: `src/models/user.js` (2 个问题)

**问题 3: 模糊的变量命名 (优先级: 中)**
- **位置**: 第 12-18 行
- **当前代码**:
```javascript
const u = await db.findOne({ id });
const d = new Date(u.createdAt);
const diff = Date.now() - d;
```

- **优化后代码**:
```javascript
const user = await db.findOne({ id });
const createdDate = new Date(user.createdAt);
const accountAge = Date.now() - createdDate;
```

---

#### 📄 文件: `src/controllers/user-controller.js` (5 个问题)

**问题 4: 深层嵌套 (优先级: 高)**
[详细建议...]

**问题 5: 缺少错误处理 (优先级: 高)**
[详细建议...]

---

#### 📄 文件: `src/utils/user-helpers.js` (2 个问题)

**问题 6: 复杂三元表达式 (优先级: 中)**
[详细建议...]
```

**分批应用优化**:

由于文件较多，建议分批处理：

```bash
# 批次 1: 处理高优先级问题（文件 1 和 3）
# 在 Claude Code 中确认应用 user-service.js 和 user-controller.js 的优化

# 运行测试
$ npm test src/services/user-service.test.js
$ npm test src/controllers/user-controller.test.js

# 批次 2: 处理中优先级问题（文件 2 和 4）
# 在 Claude Code 中确认应用 user.js 和 user-helpers.js 的优化

# 再次运行测试
$ npm test

# 所有优化完成后，生成提交信息
/commit
```

**提交信息示例**:
```
refactor(user): improve code quality across user management module

- Simplify nested conditionals in user-controller and user-service
- Extract reusable permission check function
- Improve variable naming in user model
- Break down large updateUserProfile function
- Simplify complex ternary expressions in user-helpers

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 团队协作工作流

### 示例 4: Code Review 前的自检

**场景**: 在创建 Pull Request 前，使用 staged-simplifier 确保代码质量。

```bash
# 1. 完成功能分支开发
$ git checkout -b feature/user-avatar-upload

# 2. 开发完成，准备提交
$ git add .

# 3. 第一步：优化代码质量
/staged-simplifier

# 4. 应用所有优化建议

# 5. 第二步：检查潜在风险
/staged-changes-review

# 6. 解决所有高风险问题

# 7. 第三步：生成规范的提交信息
/commit

# 8. 推送到远程并创建 PR
$ git push origin feature/user-avatar-upload
$ gh pr create --title "feat: add user avatar upload" --body "..."
```

**优势**:
- ✅ 代码审查时更容易被接受
- ✅ 减少审查者的负担
- ✅ 提升团队整体代码质量
- ✅ 培养良好的编码习惯

---

### 示例 5: 与团队标准集成

**项目配置** (`CLAUDE.md`):
```markdown
# 项目编码规范

## JavaScript/TypeScript 标准

- 使用 ESLint (Airbnb 规范)
- 使用 Prettier 格式化
- 函数最大长度: 50 行
- 圈复杂度最大值: 10
- 禁止使用 var，使用 const/let
- 优先使用箭头函数

## 命名规范

- 函数: camelCase
- 类: PascalCase
- 常量: UPPER_SNAKE_CASE
- 私有方法: _camelCase

## 提交规范

- 遵循 Conventional Commits
- 必须包含 type: feat, fix, refactor, docs, test, chore
- 提交前必须通过所有测试
```

**使用 staged-simplifier**:

```bash
# staged-simplifier 会自动读取 CLAUDE.md
/staged-simplifier
```

**输出会参考项目标准**:
```markdown
## 暂存文件优化建议

#### 📄 文件: `src/auth/login.js`

**问题 1: 违反项目标准 - 使用了 var (优先级: 高)**
- **位置**: 第 8 行
- **项目标准**: 禁止使用 var，使用 const/let
- **当前代码**: `var token = generateToken(user);`
- **优化后代码**: `const token = generateToken(user);`

**问题 2: 函数过长 (优先级: 高)**
- **位置**: 第 15-78 行 (63 行)
- **项目标准**: 函数最大长度 50 行
- **建议**: 提取 `validateCredentials` 和 `handleLoginSuccess` 子函数

**问题 3: 违反命名规范 (优先级: 中)**
- **位置**: 第 25 行
- **项目标准**: 私有方法使用 _camelCase
- **当前代码**: `function internalValidate() {}`
- **优化后代码**: `function _validateInternal() {}`
```

---

## CI/CD 集成

### 示例 6: GitHub Actions 自动提示

**配置文件** (`.github/workflows/code-quality.yml`):
```yaml
name: Code Quality Check

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier
        run: npm run format:check

      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Code quality checks failed!\n\n💡 **建议**: 在提交前运行 `/staged-simplifier` 优化代码质量\n\n详细信息请查看上方的检查结果。'
            })
```

**工作流**:
```bash
# 1. 开发者在本地使用 /staged-simplifier
/staged-simplifier

# 2. 应用优化并提交
git commit -m "feat: add new feature"
git push

# 3. GitHub Actions 运行代码质量检查
# 如果通过，PR 可以合并
# 如果失败，会自动评论提示使用 /staged-simplifier
```

---

### 示例 7: Pre-commit Hook 集成

**安装 Husky**:
```bash
npm install --save-dev husky
npx husky install
```

**配置 pre-commit hook** (`.husky/pre-commit`):
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. 运行 linter
npm run lint-staged

# 2. 运行测试
npm test

# 3. 提示使用 staged-simplifier
echo ""
echo "💡 提示: 建议运行以下命令优化代码质量:"
echo "   /staged-simplifier     - 优化暂存的代码"
echo "   /staged-changes-review - 检查潜在风险"
echo "   /commit                - 生成规范提交信息"
echo ""
echo "按 Enter 继续提交，或 Ctrl+C 取消并优化代码..."
read -r

exit 0
```

**使用体验**:
```bash
$ git commit -m "add feature"

🔍 Running pre-commit checks...
✓ ESLint passed
✓ Tests passed

💡 提示: 建议运行以下命令优化代码质量:
   /staged-simplifier     - 优化暂存的代码
   /staged-changes-review - 检查潜在风险
   /commit                - 生成规范提交信息

按 Enter 继续提交，或 Ctrl+C 取消并优化代码...
[按 Ctrl+C]

# 在 Claude Code 中运行
/staged-simplifier
# 应用优化
/commit

# 再次提交
$ git commit -m "refactor: improve code quality"
[feature/new-feature 1a2b3c4] refactor: improve code quality
 3 files changed, 45 insertions(+), 67 deletions(-)
```

---

## 总结

### 推荐工作流

**标准流程**:
```
开发 → 测试 → git add → /staged-simplifier → /staged-changes-review → /commit → git push
```

**快速流程**（小改动）:
```
开发 → git add → /staged-simplifier → /commit → git push
```

**严格流程**（重要功能）:
```
开发 → 测试 → Code Review → git add → /staged-simplifier → /staged-changes-review → 团队 Review → /commit → git push
```

### 最佳实践

1. **小步提交**: 每次暂存少量文件（<5 个），更容易优化
2. **优先修复高优先级问题**: 先处理嵌套、命名等明显问题
3. **运行测试**: 每次应用优化后立即运行测试验证
4. **参考项目标准**: 确保优化符合团队规范
5. **渐进优化**: 不必一次性修复所有问题，可以分多次提交

### 技能组合

| 技能组合 | 使用场景 |
|---------|---------|
| `/staged-simplifier` + `/commit` | 日常开发提交 |
| `/staged-simplifier` + `/staged-changes-review` + `/commit` | 重要功能提交 |
| `/code-simplifier` → `git add` → `/staged-simplifier` | 全面代码重构 |
| `/staged-simplifier` + `gh pr create` | 创建 Pull Request |
