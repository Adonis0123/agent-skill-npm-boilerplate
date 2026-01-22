# CLAUDE.md 配置示例

## 什么是 CLAUDE.md？

`CLAUDE.md` 是一个项目级别的配置文件，用于定义你的**编码标准**、**最佳实践**和**项目约定**。Code Simplifier 技能会读取这个文件来了解你的项目偏好，确保代码优化符合你的团队规范。

## 文件位置

将 `CLAUDE.md` 放在项目根目录：

```
your-project/
├── CLAUDE.md          # 项目编码标准
├── src/
├── package.json
└── ...
```

## 完整示例

以下是一个功能完整的 `CLAUDE.md` 示例：

```markdown
# CLAUDE.md

## 项目概述

这是一个使用 React + TypeScript 构建的电商前端应用。我们重视代码的可维护性、可测试性和性能。

## 技术栈

- **框架**: React 18 + Next.js 14
- **语言**: TypeScript 5
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **测试**: Vitest + React Testing Library
- **构建工具**: Turbopack

## 编码规范

### 1. 命名约定

- **组件**: PascalCase (`UserProfile.tsx`)
- **Hook**: camelCase with `use` prefix (`useUserData.ts`)
- **工具函数**: camelCase (`formatCurrency.ts`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **类型**: PascalCase with `I` prefix for interfaces (`IUser`)

### 2. 文件组织

```
src/
├── components/       # 可复用组件
│   ├── ui/          # 基础 UI 组件（按钮、输入框等）
│   └── features/    # 业务组件
├── hooks/           # 自定义 Hooks
├── lib/             # 工具函数和常量
├── types/           # TypeScript 类型定义
└── app/             # Next.js 页面（App Router）
```

### 3. TypeScript 最佳实践

- **总是显式声明函数返回类型**
  ```typescript
  // ✅ 好
  function fetchUser(id: string): Promise<User> { ... }

  // ❌ 避免
  function fetchUser(id: string) { ... }
  ```

- **使用接口而非类型别名**（除非需要联合类型）
  ```typescript
  // ✅ 好
  interface IUserProps {
    name: string;
    age: number;
  }

  // ❌ 避免（除非需要联合）
  type UserProps = {
    name: string;
    age: number;
  }
  ```

- **避免 `any`，使用 `unknown` 或泛型**

### 4. React 组件规范

- **单一职责**: 每个组件只做一件事
- **组件大小**: 不超过 200 行（含类型定义）
- **提取复杂逻辑**: 超过 3 行的逻辑应提取为 Hook 或工具函数
- **Prop 验证**: 始终定义 Props 接口

示例：
```tsx
interface IButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  onClick,
  children
}: IButtonProps): JSX.Element {
  return (
    <button
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 5. 代码清晰度原则

- **提前返回** (Guard Clauses)
  ```typescript
  // ✅ 好
  function processUser(user: User | null): string {
    if (!user) return 'No user';
    if (!user.isActive) return 'Inactive';
    return user.name;
  }

  // ❌ 避免
  function processUser(user: User | null): string {
    if (user) {
      if (user.isActive) {
        return user.name;
      } else {
        return 'Inactive';
      }
    } else {
      return 'No user';
    }
  }
  ```

- **避免嵌套三元表达式**
  ```typescript
  // ✅ 好
  const statusConfig = {
    active: 'Active User',
    inactive: 'Inactive User',
    pending: 'Pending User'
  };
  const message = statusConfig[user.status] || 'Unknown';

  // ❌ 避免
  const message = user.status === 'active'
    ? 'Active User'
    : user.status === 'inactive'
      ? 'Inactive User'
      : 'Pending User';
  ```

- **有意义的变量名**
  ```typescript
  // ✅ 好
  const filteredActiveUsers = users.filter(u => u.isActive);

  // ❌ 避免
  const arr = users.filter(u => u.isActive);
  ```

### 6. 性能考虑

- **使用 React.memo** 优化重渲染（仅在必要时）
- **使用 useMemo/useCallback** 优化昂贵计算和回调
- **懒加载路由组件**: `const Page = lazy(() => import('./Page'))`
- **图片优化**: 使用 Next.js `<Image>` 组件

### 7. 错误处理

- **异步操作总是使用 try-catch**
  ```typescript
  async function fetchData(): Promise<Data> {
    try {
      const response = await api.getData();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw new Error('Data fetch failed');
    }
  }
  ```

- **使用 Error Boundary 捕获 React 组件错误**

## 项目结构约定

### API 调用
- 所有 API 调用集中在 `src/lib/api/`
- 使用统一的错误处理和重试逻辑

### 状态管理
- 全局状态使用 Zustand
- 组件局部状态优先使用 `useState`
- 服务端状态使用 React Query（如果适用）

### 样式
- 优先使用 Tailwind 工具类
- 自定义样式使用 CSS Modules（仅在必要时）
- 避免内联样式（除非动态计算）

## 测试标准

- **覆盖率**: 核心业务逻辑 > 80%
- **测试类型**: 单元测试（工具函数）+ 集成测试（组件）
- **命名**: `*.test.ts` / `*.test.tsx`

## 最佳实践清单

在代码审查时检查：
- [ ] 函数是否单一职责？
- [ ] 是否有硬编码的魔法数字/字符串？
- [ ] 是否有超过 3 层的嵌套？
- [ ] 变量命名是否清晰？
- [ ] 是否有重复代码可以提取？
- [ ] 类型定义是否完整？
- [ ] 错误处理是否健全？

## 工具配置

- **ESLint**: 使用 `eslint-config-next`
- **Prettier**: 2 空格缩进，单引号，结尾分号
- **Husky**: pre-commit 运行 lint 和 format

## 联系

有问题或建议？联系团队负责人 @tech-lead
```

## 创建你的 CLAUDE.md

### 步骤 1: 基本结构

从简单开始，包含这些核心部分：
1. 项目概述（技术栈、目标）
2. 命名约定（组件、文件、变量）
3. 文件组织结构
4. 关键编码原则（2-3 条）

### 步骤 2: 逐步扩展

随着项目发展，添加：
- 具体的代码示例（好/坏对比）
- 性能和安全考虑
- 测试标准
- 工具配置说明

### 步骤 3: 保持更新

- 在代码审查中发现新模式时更新
- 团队讨论后添加新规范
- 定期审查并删除过时内容

## 参考资源

- [Anthropic - Writing Effective CLAUDE.md](https://docs.anthropic.com/claude/docs/project-knowledge)
- [Google Style Guides](https://google.github.io/styleguide/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 提示

- **简洁优先**: 从 50-100 行开始，不要一开始就写太详细
- **示例驱动**: 每个规则最好有代码示例
- **团队共识**: 确保规范是团队讨论的结果，不是个人偏好
- **版本控制**: 将 CLAUDE.md 提交到 Git，像对待代码一样管理

有了 CLAUDE.md，Code Simplifier 将能更好地理解你的项目需求，提供更精准的代码优化建议！
