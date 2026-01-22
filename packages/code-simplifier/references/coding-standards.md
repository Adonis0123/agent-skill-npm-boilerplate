# 通用编码标准参考

本文档提供了与编程语言无关的通用编码标准，适用于大多数项目。Code Simplifier 在没有项目特定 `CLAUDE.md` 时会参考这些原则。

## 清晰度原则

### 1. 明确优于隐式

**原则**: 代码应该清楚表达其意图，而不是依赖隐式行为或约定俗成的假设。

**示例**：

❌ **差**:
```javascript
function process(d) {
  return d > 0 ? d * 2 : 0;
}
```

✅ **好**:
```javascript
function processDiscount(discountPercentage) {
  const isValidDiscount = discountPercentage > 0;
  return isValidDiscount ? discountPercentage * 2 : 0;
}
```

**改进点**: 明确的函数名和变量名说明了代码的业务含义。

---

### 2. 避免深层嵌套

**原则**: 嵌套超过 3 层会显著降低可读性。使用提前返回（guard clauses）来扁平化代码。

**示例**：

❌ **差**:
```typescript
function validateUser(user: User): boolean {
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

✅ **好**:
```typescript
function validateUser(user: User): boolean {
  if (!user) return false;
  if (!user.email) return false;
  if (!user.email.includes('@')) return false;
  if (user.age < 18) return false;
  return true;
}
```

**改进点**: 从 4 层嵌套减少到 0 层，逻辑流程清晰。

---

### 3. 避免嵌套三元表达式

**原则**: 三元表达式适合简单的二选一，嵌套会快速变得难以理解。

**示例**：

❌ **差**:
```javascript
const message = user.isActive
  ? user.isPremium
    ? 'Premium User'
    : user.isVerified
      ? 'Verified User'
      : 'Regular User'
  : 'Inactive User';
```

✅ **好**:
```javascript
function getUserMessage(user) {
  if (!user.isActive) return 'Inactive User';
  if (user.isPremium) return 'Premium User';
  if (user.isVerified) return 'Verified User';
  return 'Regular User';
}

const message = getUserMessage(user);
```

**或使用对象映射**:
```javascript
const STATUS_MESSAGES = {
  'active-premium': 'Premium User',
  'active-verified': 'Verified User',
  'active-regular': 'Regular User',
  'inactive': 'Inactive User'
};

function getStatusKey(user) {
  if (!user.isActive) return 'inactive';
  if (user.isPremium) return 'active-premium';
  if (user.isVerified) return 'active-verified';
  return 'active-regular';
}

const message = STATUS_MESSAGES[getStatusKey(user)];
```

**改进点**: 逻辑清晰，易于扩展和维护。

---

### 4. 有意义的命名

**原则**: 名称应该清楚说明变量/函数的用途，避免缩写和单字母变量（除循环计数器外）。

**示例**：

❌ **差**:
```python
def calc(a, b, c):
    return a * b + c

result = calc(5, 10, 20)
```

✅ **好**:
```python
def calculate_total_price(
    quantity: int,
    unit_price: float,
    shipping_cost: float
) -> float:
    """计算商品总价（含运费）"""
    return quantity * unit_price + shipping_cost

total_price = calculate_total_price(
    quantity=5,
    unit_price=10.0,
    shipping_cost=20.0
)
```

**改进点**: 无需注释即可理解代码意图。

---

## 函数设计

### 5. 单一职责原则

**原则**: 每个函数应该只做一件事，并做好这件事。

**示例**：

❌ **差**:
```javascript
function processOrder(order) {
  // 验证订单
  if (!order.items || order.items.length === 0) {
    throw new Error('No items');
  }

  // 计算总价
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }

  // 应用折扣
  if (order.coupon) {
    total *= (1 - order.coupon.discount);
  }

  // 发送邮件
  sendEmail(order.email, `Your order total: $${total}`);

  return total;
}
```

✅ **好**:
```javascript
function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('No items');
  }
}

function calculateOrderTotal(items) {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function applyDiscount(total, coupon) {
  return coupon ? total * (1 - coupon.discount) : total;
}

function sendOrderConfirmation(email, total) {
  sendEmail(email, `Your order total: $${total}`);
}

function processOrder(order) {
  validateOrder(order);
  let total = calculateOrderTotal(order.items);
  total = applyDiscount(total, order.coupon);
  sendOrderConfirmation(order.email, total);
  return total;
}
```

**改进点**: 每个函数职责清晰，易于测试和复用。

---

### 6. 提前返回

**原则**: 在函数开头处理边界情况和错误，避免在主逻辑中嵌套错误处理。

**示例**：

❌ **差**:
```typescript
function getUserProfile(userId: string): UserProfile {
  let profile = null;
  if (userId) {
    const user = findUser(userId);
    if (user) {
      if (user.isActive) {
        profile = {
          name: user.name,
          email: user.email
        };
      }
    }
  }
  return profile;
}
```

✅ **好**:
```typescript
function getUserProfile(userId: string): UserProfile | null {
  if (!userId) return null;

  const user = findUser(userId);
  if (!user) return null;
  if (!user.isActive) return null;

  return {
    name: user.name,
    email: user.email
  };
}
```

**改进点**: 主逻辑（构建 profile）不被错误处理嵌套包围。

---

## React 特定最佳实践

### 7. 组件拆分

**原则**: 组件超过 200 行或处理多个关注点时应拆分。

**示例**：

❌ **差**:
```tsx
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // 50 行的数据获取逻辑...
  // 30 行的状态更新逻辑...
  // 100 行的 UI 渲染...

  return (
    <div>
      {/* 复杂的 JSX... */}
    </div>
  );
}
```

✅ **好**:
```tsx
// 拆分为多个小组件
function UserDashboard() {
  const user = useUser();

  return (
    <div>
      <UserHeader user={user} />
      <UserOrders userId={user.id} />
      <UserNotifications userId={user.id} />
    </div>
  );
}

function UserHeader({ user }: { user: User }) {
  return <header>Welcome, {user.name}</header>;
}

function UserOrders({ userId }: { userId: string }) {
  const orders = useOrders(userId);
  return <OrderList orders={orders} />;
}

function UserNotifications({ userId }: { userId: string }) {
  const notifications = useNotifications(userId);
  return <NotificationList items={notifications} />;
}
```

**改进点**: 每个组件职责单一，易于理解和维护。

---

## TypeScript 最佳实践

### 8. 显式类型注解

**原则**: 对于函数参数和返回值，总是使用显式类型注解。

**示例**：

❌ **差**:
```typescript
function fetchData(url) {
  return fetch(url).then(res => res.json());
}
```

✅ **好**:
```typescript
interface IApiResponse {
  data: unknown;
  status: number;
}

async function fetchData(url: string): Promise<IApiResponse> {
  const response = await fetch(url);
  const data = await response.json();
  return {
    data,
    status: response.status
  };
}
```

**改进点**: 类型安全，IDE 提示完整。

---

## 性能考虑

### 9. 避免过早优化

**原则**: 首先写清晰的代码，只在性能分析证明必要时才优化。

**示例**：

❌ **过早优化**:
```javascript
// 为了"性能"使用位运算，但牺牲了可读性
function isEven(n) {
  return !(n & 1);
}
```

✅ **清晰优先**:
```javascript
function isEven(n) {
  return n % 2 === 0;
}
```

**注意**: 只有在性能分析显示这是瓶颈时，才考虑优化（在 JavaScript 中，这两者性能差异可忽略）。

---

### 10. 消除重复

**原则**: DRY（Don't Repeat Yourself）- 相同的逻辑不应出现多次。

**示例**：

❌ **差**:
```javascript
function handleSubmitButton() {
  button.disabled = true;
  button.textContent = 'Submitting...';
  button.classList.add('loading');
}

function handleCancelButton() {
  button.disabled = false;
  button.textContent = 'Submit';
  button.classList.remove('loading');
}
```

✅ **好**:
```javascript
function setButtonState(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Submitting...' : 'Submit';
  button.classList.toggle('loading', isLoading);
}

function handleSubmitButton() {
  setButtonState(true);
}

function handleCancelButton() {
  setButtonState(false);
}
```

**改进点**: 按钮状态逻辑集中管理，修改一处即可影响所有调用。

---

## 总结检查清单

在简化代码时，检查以下几点：

- [ ] **嵌套层级** < 3 层
- [ ] **函数长度** < 50 行（理想情况）
- [ ] **单一职责**: 每个函数只做一件事
- [ ] **命名清晰**: 变量/函数名清楚表达意图
- [ ] **提前返回**: 错误处理在函数开头
- [ ] **无重复**: 相同逻辑已提取为函数
- [ ] **类型安全**: TypeScript 类型注解完整
- [ ] **性能合理**: 无明显性能问题

## 参考资源

- [Clean Code (Robert C. Martin)](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Refactoring (Martin Fowler)](https://refactoring.com/)
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/)
- [Google Style Guides](https://google.github.io/styleguide/)

---

这些原则是 Code Simplifier 的基础。如果你的项目有特殊需求，请创建 `CLAUDE.md` 来定义项目特定的标准！
