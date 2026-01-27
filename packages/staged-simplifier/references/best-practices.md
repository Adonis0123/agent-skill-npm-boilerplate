# Best Practices

使用最佳实践和性能优化建议

## 目录

- [推荐使用场景](#推荐使用场景)
- [不推荐使用场景](#不推荐使用场景)
- [性能优化技巧](#性能优化技巧)
- [常见问题解答](#常见问题解答)
- [与其他技能的配合](#与其他技能的配合)

---

## 推荐使用场景

### ✅ 场景 1: 功能开发完成，准备提交

**适用情况**:
- 完成了一个功能模块的开发
- 通过了本地测试
- 已经通过 `git add` 暂存了相关文件
- 希望确保提交的代码质量高

**示例**:
```bash
# 开发完成
vim src/features/payment.js

# 测试通过
npm test

# 暂存文件
git add src/features/payment.js src/utils/payment-helpers.js

# 优化代码质量
/staged-simplifier
```

**优势**:
- 确保每次提交都是高质量的
- 避免在代码审查阶段被要求修改基础问题
- 养成良好的编码习惯

---

### ✅ 场景 2: Bug 修复后的代码清理

**适用情况**:
- 修复了一个 bug
- 修改过程中可能引入了一些临时代码或调试代码
- 希望在提交前清理代码

**示例**:
```bash
# 修复 bug（可能添加了大量调试代码）
vim src/services/auth-service.js

# 暂存修改
git add src/services/auth-service.js

# 清理代码（移除调试代码、优化逻辑）
/staged-simplifier
```

**优化示例**:

**修复 bug 后的代码**:
```javascript
function authenticateUser(username, password) {
  console.log('DEBUG: authenticating user:', username); // 调试代码
  const user = findUser(username);
  console.log('DEBUG: found user:', user); // 调试代码
  if (user) {
    if (user.password === password) {
      console.log('DEBUG: password match'); // 调试代码
      return { success: true, user };
    }
  }
  console.log('DEBUG: auth failed'); // 调试代码
  return { success: false };
}
```

**staged-simplifier 优化后**:
```javascript
function authenticateUser(username, password) {
  const user = findUser(username);
  if (!user) return { success: false };

  const isPasswordMatch = user.password === password;
  return isPasswordMatch
    ? { success: true, user }
    : { success: false };
}
```

**改进点**:
- ✅ 移除所有调试代码
- ✅ 简化嵌套逻辑
- ✅ 提升可读性

---

### ✅ 场景 3: 重构遗留代码

**适用情况**:
- 在重构旧代码
- 需要确保重构后的代码符合现代标准
- 希望逐步提交重构进度

**示例**:
```bash
# 重构一个旧的 ES5 模块为 ES6+
vim src/legacy/user-manager.js

# 暂存重构后的代码
git add src/legacy/user-manager.js

# 应用现代最佳实践
/staged-simplifier
```

**优化示例**:

**重构前（ES5）**:
```javascript
var UserManager = function() {
  this.users = [];
};

UserManager.prototype.addUser = function(user) {
  if (user) {
    if (user.name) {
      if (user.email) {
        this.users.push(user);
        return true;
      }
    }
  }
  return false;
};
```

**重构后（ES6 但仍有问题）**:
```javascript
class UserManager {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    if (user) {
      if (user.name) {
        if (user.email) {
          this.users.push(user);
          return true;
        }
      }
    }
    return false;
  }
}
```

**staged-simplifier 优化后（ES6 + 最佳实践）**:
```javascript
class UserManager {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    if (!user?.name || !user?.email) {
      return false;
    }

    this.users.push(user);
    return true;
  }
}
```

**改进点**:
- ✅ 使用可选链操作符（`?.`）
- ✅ 使用 guard clauses 减少嵌套
- ✅ 更现代的代码风格

---

### ✅ 场景 4: Code Review 前的自检

**适用情况**:
- 准备创建 Pull Request
- 希望减少审查者的工作量
- 想要提升 PR 被接受的概率

**示例**:
```bash
# 开发完成
git checkout -b feature/user-notification

# 暂存所有修改
git add .

# 第一步：优化代码质量
/staged-simplifier

# 第二步：检查潜在风险
/staged-changes-review

# 第三步：生成提交信息
/commit

# 创建 PR
gh pr create --title "feat: add user notification system"
```

**优势**:
- ✅ PR 更容易通过审查
- ✅ 减少来回修改的次数
- ✅ 展现专业的编码素养
- ✅ 加快功能上线速度

---

### ✅ 场景 5: 团队协作中的标准化

**适用情况**:
- 团队有明确的编码规范（`CLAUDE.md`）
- 希望确保所有提交符合团队标准
- 新成员需要快速适应团队规范

**示例**:

**团队标准** (`CLAUDE.md`):
```markdown
# 团队编码规范

## 命名规范
- 函数: camelCase
- 类: PascalCase
- 常量: UPPER_SNAKE_CASE
- 私有方法: _camelCase

## 代码风格
- 单引号优于双引号
- 尾随逗号
- 箭头函数优于 function
- 使用 const/let，禁用 var
```

**使用 staged-simplifier**:
```bash
git add src/components/UserCard.js

# staged-simplifier 会自动读取 CLAUDE.md 并应用团队标准
/staged-simplifier
```

**优化示例**:

**提交前的代码**:
```javascript
// 违反团队标准
var MAX_USERS = 100; // 应该用 const
function _GetUsers() {} // 私有方法命名错误
const data = users.map(function(user) { return user.name }); // 应该用箭头函数
```

**staged-simplifier 优化后**:
```javascript
// 符合团队标准
const MAX_USERS = 100;
function _getUsers() {}
const data = users.map(user => user.name);
```

---

## 不推荐使用场景

### ❌ 场景 1: 没有暂存任何文件

**问题**:
```bash
# 错误：没有暂存文件就运行
git status
# On branch main
# Changes not staged for commit:
#   modified:   src/app.js

/staged-simplifier
# ❌ 错误: 当前没有暂存的文件
```

**正确做法**:
```bash
# 先暂存文件
git add src/app.js

# 再运行优化
/staged-simplifier
```

**或者使用**:
```bash
# 如果不想暂存，使用通用的 code-simplifier
/code-simplifier
```

---

### ❌ 场景 2: 暂存了大量文件（>20 个）

**问题**:
```bash
git add .
git status --short
# M  src/file1.js
# M  src/file2.js
# M  src/file3.js
# ... (共 50 个文件)

/staged-simplifier
# ⚠️ 警告：暂存文件过多，可能导致分析时间过长
```

**更好的做法**:
```bash
# 分批暂存和优化
git add src/feature1/*.js
/staged-simplifier

git add src/feature2/*.js
/staged-simplifier

git add src/utils/*.js
/staged-simplifier
```

**或者**:
```bash
# 对每个功能模块单独提交
git add src/feature1/*.js
/staged-simplifier
/commit

git add src/feature2/*.js
/staged-simplifier
/commit
```

---

### ❌ 场景 3: 暂存了非代码文件

**问题**:
```bash
git add images/logo.png docs/api.pdf package-lock.json

/staged-simplifier
# ⚠️ 警告: 暂存的文件中没有代码文件
```

**正确做法**:
```bash
# 仅暂存代码文件
git add src/*.js src/*.ts

/staged-simplifier
```

**或者**:
```bash
# 分开提交代码和资源文件
git add src/*.js src/*.ts
/staged-simplifier
/commit -m "feat: add new features"

git add images/logo.png docs/api.pdf
git commit -m "docs: update logo and API documentation"
```

---

### ❌ 场景 4: 在不是 Git 仓库的目录中使用

**问题**:
```bash
cd /tmp/my-project
/staged-simplifier
# ❌ 错误: 当前目录不是 Git 仓库
```

**正确做法**:
```bash
# 如果不在 Git 仓库中，使用通用的 code-simplifier
/code-simplifier
```

**或者**:
```bash
# 初始化 Git 仓库
git init
git add .
/staged-simplifier
```

---

### ❌ 场景 5: 优化自动生成的代码

**问题**:
```bash
# 错误：尝试优化构建产物
git add dist/bundle.js package-lock.json
/staged-simplifier
```

**正确做法**:
```bash
# 将自动生成的文件添加到 .gitignore
echo "dist/" >> .gitignore
echo "package-lock.json" >> .gitignore

# 仅暂存源代码
git add src/*.js
/staged-simplifier
```

---

## 性能优化技巧

### 技巧 1: 分批处理大量文件

**场景**: 暂存了 15 个文件，担心处理时间过长。

**策略**:
```bash
# 方法 1: 按功能模块分组
git add src/auth/*.js
/staged-simplifier
git commit -m "refactor(auth): improve code quality"

git add src/payment/*.js
/staged-simplifier
git commit -m "refactor(payment): improve code quality"

# 方法 2: 按优先级分组（先处理核心文件）
git add src/core/app.js src/core/router.js
/staged-simplifier
git commit -m "refactor(core): improve code quality"

git add src/utils/*.js
/staged-simplifier
git commit -m "refactor(utils): improve code quality"
```

**优势**:
- ✅ 更快的分析速度
- ✅ 更小的提交粒度
- ✅ 更容易回滚
- ✅ 更清晰的提交历史

---

### 技巧 2: 跳过大文件的全量分析

**场景**: 单个文件超过 1000 行。

**策略**:

```bash
# 1. 查看文件修改的具体位置
git diff --cached src/large-file.js

# 2. 仅优化修改的部分
# 在 Claude Code 中指定：
# "仅优化 src/large-file.js 的第 450-520 行"
```

**示例对话**:
```
用户: /staged-simplifier

Claude: 发现 src/large-file.js 文件较大（1200 行），建议仅优化修改的部分。
       检测到修改集中在第 450-520 行，是否仅优化此部分？

用户: 是的，仅优化修改的部分

Claude: [仅读取和优化第 450-520 行的代码]
```

---

### 技巧 3: 使用优先级过滤

**场景**: 时间紧张，只想修复最重要的问题。

**策略**:

```bash
# 在 Claude Code 中指定
# "仅显示高优先级的问题"
/staged-simplifier
```

**示例输出**:
```markdown
## 暂存文件优化建议

### 概览
- 暂存文件数量: 8
- 高优先级问题: 3
- 中优先级问题: 12 (已隐藏)
- 低优先级问题: 5 (已隐藏)

### 高优先级问题

#### 📄 文件: `src/auth.js`
**问题 1: 深层嵌套 (7 层)**
[详细建议...]

#### 📄 文件: `src/payment.js`
**问题 2: 安全风险 - 硬编码密钥**
[详细建议...]

#### 📄 文件: `src/utils.js`
**问题 3: 过长函数 (150 行)**
[详细建议...]
```

---

### 技巧 4: 缓存项目标准

**场景**: 在同一个项目中频繁使用 staged-simplifier。

**策略**:

由于 staged-simplifier 会读取项目的 `CLAUDE.md`，可以优化读取策略：

```markdown
# 在 CLAUDE.md 中明确定义标准
# 这样 staged-simplifier 可以快速应用规则

## 编码标准（staged-simplifier 配置）

### 快速检查项
- [ ] 无深层嵌套（最大 3 层）
- [ ] 函数最大长度 50 行
- [ ] 使用有意义的变量名
- [ ] 无重复代码
- [ ] 符合 ESLint 规则
```

**优势**:
- ✅ 更快的分析速度
- ✅ 更一致的优化结果
- ✅ 团队成员都遵循相同标准

---

### 技巧 5: 与 Linter 配合使用

**策略**:

```bash
# 1. 先运行 linter 修复自动可修复的问题
npm run lint -- --fix

# 2. 暂存 linter 修复的代码
git add .

# 3. 运行 staged-simplifier 处理更复杂的问题
/staged-simplifier

# 4. 应用优化建议

# 5. 再次运行 linter 确保没有引入新问题
npm run lint
```

**优势**:
- ✅ 自动修复简单问题
- ✅ staged-simplifier 专注于复杂的逻辑优化
- ✅ 确保最终代码符合所有规范

---

## 常见问题解答

### Q1: staged-simplifier 和 code-simplifier 有什么区别？

**A**:

| 维度 | staged-simplifier | code-simplifier |
|------|-------------------|-----------------|
| **作用对象** | 仅 git 暂存的文件 | 任意代码文件 |
| **前置条件** | 需要在 git 仓库中 | 无要求 |
| **使用时机** | `git add` 之后 | 任何时候 |
| **适用场景** | 提交前代码优化 | 开发过程中的任何时候 |
| **自动触发** | "优化暂存的代码" | "简化代码"、"优化代码" |

**推荐做法**:
- 开发过程中：使用 `/code-simplifier` 随时优化
- 提交前：使用 `/staged-simplifier` 确保提交质量

---

### Q2: staged-simplifier 会修改 git staging area 吗？

**A**: 不会。staged-simplifier 修改的是工作目录中的文件，git staging area 保持不变。

**示例**:
```bash
# 1. 暂存文件
git add src/app.js
git status
# Changes to be committed:
#   modified:   src/app.js

# 2. 运行 staged-simplifier
/staged-simplifier
# (应用优化建议，修改 src/app.js)

# 3. 检查状态
git status
# Changes to be committed:
#   modified:   src/app.js  <-- 仍然是暂存状态

# 4. 查看修改
git diff --cached
# (显示暂存的内容，包括 staged-simplifier 的优化)
```

**注意**: 如果 staged-simplifier 修改了文件，修改会自动反映在 staging area 中。

---

### Q3: 可以跳过某些文件吗？

**A**: 可以。有以下几种方法：

**方法 1: 分批暂存**
```bash
# 仅暂存需要优化的文件
git add src/feature1.js src/feature2.js
/staged-simplifier

# 单独暂存不需要优化的文件
git add src/config.js
git commit -m "chore: update config"
```

**方法 2: 在 Claude Code 中明确指定**
```
用户: /staged-simplifier，但跳过 src/legacy/old-module.js

Claude: 了解，将跳过 src/legacy/old-module.js，仅优化其他暂存文件。
```

**方法 3: 使用 .gitattributes**
```bash
# .gitattributes
src/legacy/** linguist-generated=true
```

---

### Q4: staged-simplifier 会破坏代码功能吗？

**A**: 不会。staged-simplifier 遵循 code-simplifier 的核心原则：**保持功能不变**。

**安全保障**:
1. **仅优化代码质量**，不改变业务逻辑
2. **提供前后对比**，用户可以审查每个修改
3. **用户确认后才应用**修改
4. **建议运行测试**验证功能

**最佳实践**:
```bash
# 应用优化后立即运行测试
/staged-simplifier
# (应用优化建议)

npm test
# ✓ All tests passed

git commit -m "refactor: improve code quality"
```

---

### Q5: 如何处理与 Prettier/ESLint 的冲突？

**A**: staged-simplifier 会尊重项目的 Prettier/ESLint 配置。

**推荐工作流**:
```bash
# 1. 先运行 Prettier/ESLint 自动修复
npm run lint -- --fix
npm run format

# 2. 暂存自动修复的代码
git add .

# 3. 运行 staged-simplifier 处理更高级的优化
/staged-simplifier

# 4. 再次运行 linter 确保没有引入新问题
npm run lint
```

**如果仍有冲突**:
```bash
# 优先遵循 Prettier/ESLint 配置
# 在 Claude Code 中指定：
用户: /staged-simplifier，优化时遵循项目的 .eslintrc.json 配置

Claude: 了解，将根据 .eslintrc.json 中的规则进行优化。
```

---

## 与其他技能的配合

### 配合 1: staged-simplifier + commit

**使用场景**: 日常开发提交

**工作流**:
```bash
git add src/feature.js
/staged-simplifier  # 优化代码质量
/commit             # 生成规范提交信息
git push
```

**优势**:
- ✅ 确保每次提交都是高质量的
- ✅ 提交信息规范一致
- ✅ 快速高效

---

### 配合 2: staged-simplifier + staged-changes-review + commit

**使用场景**: 重要功能提交

**工作流**:
```bash
git add src/payment-module.js
/staged-simplifier        # 优化代码质量
/staged-changes-review    # 检查潜在风险
/commit                   # 生成提交信息
git push
```

**优势**:
- ✅ 代码质量优化
- ✅ 风险评估
- ✅ 规范提交
- ✅ 适合关键功能

---

### 配合 3: code-simplifier → git add → staged-simplifier

**使用场景**: 全面代码重构

**工作流**:
```bash
# 第一步：全面优化整个文件
/code-simplifier src/legacy-module.js
# (应用优化建议)

# 第二步：暂存优化后的代码
git add src/legacy-module.js

# 第三步：再次优化（针对暂存场景）
/staged-simplifier

# 第四步：提交
/commit
```

**优势**:
- ✅ 两次优化确保质量
- ✅ 适合大规模重构
- ✅ 分阶段验证

---

### 配合 4: staged-simplifier + gh pr create

**使用场景**: 创建高质量 Pull Request

**工作流**:
```bash
git checkout -b feature/user-notification
# (开发功能)

git add .
/staged-simplifier
/staged-changes-review
/commit

git push origin feature/user-notification
gh pr create --title "feat: add user notification system" \
             --body "High-quality code, reviewed by staged-simplifier"
```

**优势**:
- ✅ 提升 PR 被接受的概率
- ✅ 减少审查者的工作量
- ✅ 加快功能上线速度

---

## 总结

### 核心要点

1. **使用时机**: `git add` 之后，`git commit` 之前
2. **作用对象**: 仅暂存的代码文件
3. **优化原则**: 保持功能不变，提升代码质量
4. **性能优化**: 分批处理，优先修复高优先级问题
5. **技能组合**: 与 commit、staged-changes-review 配合使用

### 黄金工作流

```
开发 → 测试 → git add → /staged-simplifier → /staged-changes-review → /commit → git push
```

### 关键原则

- ✅ **小步提交**: 每次暂存少量文件（<5 个）
- ✅ **优先修复高优先级问题**: 先处理嵌套、命名等明显问题
- ✅ **运行测试**: 每次应用优化后立即运行测试
- ✅ **参考项目标准**: 确保优化符合团队规范
- ✅ **渐进优化**: 不必一次性修复所有问题
