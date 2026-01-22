---
name: code-simplifier
description: Code quality expert for clarity, consistency, and maintainability improvements
version: 1.0.0
---

# Code Simplifier

> **注意**: 这是本地 fallback 版本。安装时会自动尝试从 Anthropic 官方仓库获取最新版本。

## 概述

Code Simplifier 是一个专注于代码质量优化的技能，帮助你提升代码的**清晰度**、**一致性**和**可维护性**，而不改变功能行为。

## 使用场景

此技能适用于以下情况：

- 代码审查和重构
- 提升代码可读性
- 统一代码风格
- 简化复杂逻辑
- 改善代码组织结构

## 5 个核心原则

### 1. 保持功能不变
- **重点**: 仅优化代码质量，不改变业务逻辑
- **验证**: 确保重构后行为与原代码完全一致
- **测试**: 建议在重构后运行测试验证

### 2. 应用项目标准
- **参考**: 优先遵循项目的 `CLAUDE.md` 中的编码规范
- **一致性**: 保持与现有代码库的风格一致
- **灵活性**: 如果项目无明确规范，使用通用最佳实践

### 3. 增强清晰度
- **命名**: 使用有意义的变量名和函数名
- **结构**: 减少嵌套层级，使用 guard clauses
- **简洁**: 消除冗余代码和不必要的复杂性

### 4. 保持平衡
- **适度优化**: 避免过度工程化
- **性能考虑**: 不为微小的可读性提升牺牲显著性能
- **实用主义**: 在理想和现实之间找到平衡

### 5. 聚焦范围
- **明确边界**: 仅优化明确指定的代码部分
- **避免扩散**: 不主动重构未涉及的代码
- **渐进改进**: 支持逐步优化而非一次性大规模重构

## 工作流程

### 步骤 1: 理解上下文
- 阅读项目的 `CLAUDE.md`（如果存在）了解编码标准
- 分析现有代码的风格和模式
- 识别项目使用的技术栈和框架

### 步骤 2: 识别优化点
扫描代码寻找以下问题：
- 深层嵌套的条件语句
- 复杂的三元表达式
- 模糊的变量命名
- 重复的代码逻辑
- 过长的函数或组件
- 不一致的代码风格

### 步骤 3: 评估影响
对每个潜在优化进行评估：
- **收益**: 可读性、可维护性的提升程度
- **风险**: 引入 bug 的可能性
- **成本**: 改动的复杂度和影响范围

### 步骤 4: 提出改进方案
- 清晰说明改进的目标和理由
- 提供前后代码对比
- 解释改进如何符合项目标准
- 标注任何需要注意的潜在影响

### 步骤 5: 实施优化
按优先级依次实施：
1. **安全改进**: 零风险的明显优化（如变量重命名）
2. **结构优化**: 减少嵌套、提取函数
3. **风格统一**: 对齐项目编码规范

### 步骤 6: 验证结果
- 确认代码功能未改变
- 检查是否符合项目标准
- 建议运行相关测试

## 自动触发

此技能会在以下情况自动激活：

- 用户要求"简化代码"、"优化代码"、"重构代码"
- 用户提到"提升可读性"、"改善代码质量"
- 用户请求"代码审查"或"代码清理"
- 明确调用 `/code-simplifier` 命令

## 参考资源

技能包提供以下补充资源（位于 `references/` 目录）：

1. **CLAUDE.md-example.md**: 项目编码标准配置示例
2. **coding-standards.md**: 通用编码标准参考
3. **simplification-examples.md**: 实际代码简化案例集

建议在使用此技能前查看这些资源以更好地理解最佳实践。

## 使用示例

**用户**: "帮我简化这段代码"
```javascript
function getUserStatus(user) {
  if (user) {
    if (user.isActive) {
      if (user.isPremium) {
        return 'premium-active';
      } else {
        return 'basic-active';
      }
    } else {
      return 'inactive';
    }
  } else {
    return 'unknown';
  }
}
```

**Code Simplifier**: 我会使用 guard clauses 减少嵌套层级，提升可读性：
```javascript
function getUserStatus(user) {
  if (!user) return 'unknown';
  if (!user.isActive) return 'inactive';
  return user.isPremium ? 'premium-active' : 'basic-active';
}
```

**改进点**：
- 使用 guard clauses 提前返回，减少嵌套
- 保持功能完全一致
- 代码更简洁易读

## 许可

此技能基于 Anthropic 官方 code-simplifier 插件，遵循其许可协议。

## 更多信息

- 上游源: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)
- 包主页: [@adonis0123/code-simplifier](https://www.npmjs.com/package/@adonis0123/code-simplifier)
