# 代码简化实战案例

本文档提供 6 个真实场景的代码简化示例，展示 Code Simplifier 的应用方法和效果。

---

## 案例 1: 减少嵌套（Guard Clauses）

### 场景
用户认证函数，包含多层权限检查。

### 优化前 ❌
```typescript
function canAccessResource(
  user: User | null,
  resource: Resource
): boolean {
  if (user) {
    if (user.isActive) {
      if (user.role === 'admin') {
        return true;
      } else {
        if (resource.isPublic) {
          return true;
        } else {
          if (resource.ownerId === user.id) {
            return true;
          } else {
            return false;
          }
        }
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

**问题**：
- 嵌套层级达到 5 层
- 逻辑难以理解
- 多余的 else 分支

### 优化后 ✅
```typescript
function canAccessResource(
  user: User | null,
  resource: Resource
): boolean {
  // Guard clauses: 提前处理失败情况
  if (!user) return false;
  if (!user.isActive) return false;

  // 管理员总是有权限
  if (user.role === 'admin') return true;

  // 检查资源访问权限
  return resource.isPublic || resource.ownerId === user.id;
}
```

**改进点**：
- 嵌套从 5 层减少到 0 层
- 逻辑流程清晰：先检查用户 → 再检查权限
- 代码行数减少 50%

---

## 案例 2: 消除冗余（逻辑简化）

### 场景
订单状态判断，包含重复的布尔逻辑。

### 优化前 ❌
```javascript
function shouldSendReminder(order) {
  const isPending = order.status === 'pending';
  const isProcessing = order.status === 'processing';
  const isShipped = order.status === 'shipped';

  if (isPending === true || isProcessing === true) {
    if (order.createdAt < Date.now() - 24 * 60 * 60 * 1000) {
      return true;
    } else {
      return false;
    }
  } else if (isShipped === true) {
    if (order.deliveredAt === null) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

**问题**：
- 重复的 `=== true` 比较（布尔值本身就是 true/false）
- 不必要的 if-else（可以直接返回表达式结果）
- 冗余的状态变量声明

### 优化后 ✅
```javascript
function shouldSendReminder(order) {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const isOldPendingOrder =
    ['pending', 'processing'].includes(order.status) &&
    order.createdAt < oneDayAgo;

  const isUndeliveredShipment =
    order.status === 'shipped' && !order.deliveredAt;

  return isOldPendingOrder || isUndeliveredShipment;
}
```

**改进点**：
- 消除了 `=== true` 冗余比较
- 将复杂条件提取为有意义的变量
- 直接返回布尔表达式，无需 if-else
- 使用 `includes()` 简化状态检查

---

## 案例 3: 改进命名（有意义的变量名）

### 场景
电商购物车价格计算。

### 优化前 ❌
```python
def calc(items, c, s):
    t = 0
    for i in items:
        t += i['p'] * i['q']

    if c:
        t = t * (1 - c)

    if t < 50:
        t += s

    return t
```

**问题**：
- 单字母变量名无法表达意图
- 魔法数字 50 没有说明
- 参数名不清晰

### 优化后 ✅
```python
FREE_SHIPPING_THRESHOLD = 50.0

def calculate_cart_total(
    items: list[dict],
    coupon_discount: float | None,
    shipping_fee: float
) -> float:
    """
    计算购物车总价（含运费和优惠）

    Args:
        items: 商品列表 [{'price': float, 'quantity': int}]
        coupon_discount: 优惠券折扣（0.1 表示 10% 折扣）
        shipping_fee: 运费

    Returns:
        最终总价
    """
    subtotal = sum(
        item['price'] * item['quantity']
        for item in items
    )

    # 应用优惠券
    if coupon_discount:
        subtotal *= (1 - coupon_discount)

    # 满额免运费
    if subtotal < FREE_SHIPPING_THRESHOLD:
        subtotal += shipping_fee

    return subtotal
```

**改进点**：
- 所有变量名清晰表达意图
- 魔法数字提取为常量
- 添加 docstring 说明函数用途
- 使用类型注解提升可维护性

---

## 案例 4: 替换嵌套三元（对象映射）

### 场景
根据用户状态显示不同的消息和样式。

### 优化前 ❌
```jsx
function UserBadge({ user }) {
  const badgeColor = user.isPremium
    ? 'gold'
    : user.isVerified
      ? 'blue'
      : user.isActive
        ? 'green'
        : 'gray';

  const badgeText = user.isPremium
    ? 'Premium Member'
    : user.isVerified
      ? 'Verified User'
      : user.isActive
        ? 'Active User'
        : 'Guest';

  const badgeIcon = user.isPremium
    ? '⭐'
    : user.isVerified
      ? '✓'
      : user.isActive
        ? '●'
        : '○';

  return (
    <span className={`badge badge-${badgeColor}`}>
      {badgeIcon} {badgeText}
    </span>
  );
}
```

**问题**：
- 三个嵌套三元表达式，重复相同的判断逻辑
- 难以维护和扩展（新增状态需要修改三处）
- 逻辑顺序不明确

### 优化后 ✅
```jsx
function UserBadge({ user }) {
  const USER_STATUS_CONFIG = {
    premium: {
      color: 'gold',
      text: 'Premium Member',
      icon: '⭐'
    },
    verified: {
      color: 'blue',
      text: 'Verified User',
      icon: '✓'
    },
    active: {
      color: 'green',
      text: 'Active User',
      icon: '●'
    },
    guest: {
      color: 'gray',
      text: 'Guest',
      icon: '○'
    }
  };

  function getUserStatus(user) {
    if (user.isPremium) return 'premium';
    if (user.isVerified) return 'verified';
    if (user.isActive) return 'active';
    return 'guest';
  }

  const status = getUserStatus(user);
  const config = USER_STATUS_CONFIG[status];

  return (
    <span className={`badge badge-${config.color}`}>
      {config.icon} {config.text}
    </span>
  );
}
```

**改进点**：
- 将配置提取为对象，易于维护和扩展
- 判断逻辑集中在一个函数中
- 新增状态只需修改配置对象，无需改动逻辑
- 更容易进行单元测试

---

## 案例 5: React 组件简化（组件拆分）

### 场景
一个包含多个功能的用户个人中心组件。

### 优化前 ❌
```tsx
function UserProfile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile">
      <div className="header">
        <img src={user.avatar} alt="Avatar" />
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        {editMode ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            // 50 行的表单处理逻辑...
          }}>
            {/* 复杂的表单字段... */}
          </form>
        ) : (
          <button onClick={() => setEditMode(true)}>Edit</button>
        )}
      </div>

      <div className="orders">
        <h2>Your Orders</h2>
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <p>Order #{order.id}</p>
            <p>Status: {order.status}</p>
            <p>Total: ${order.total}</p>
            {/* 更多订单详情... */}
          </div>
        ))}
      </div>

      <div className="settings">
        {/* 50 行的设置选项... */}
      </div>
    </div>
  );
}
```

**问题**：
- 单个组件超过 200 行
- 混合了数据获取、状态管理、UI 渲染
- 难以测试和复用

### 优化后 ✅
```tsx
// 主组件：协调子组件
function UserProfile() {
  const user = useUser();

  if (!user) return <LoadingSpinner />;

  return (
    <div className="profile">
      <UserHeader user={user} />
      <UserOrders userId={user.id} />
      <UserSettings userId={user.id} />
    </div>
  );
}

// 自定义 Hook：封装数据获取逻辑
function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  return loading ? null : user;
}

// 子组件 1: 用户头部信息
function UserHeader({ user }: { user: User }) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="header">
      <img src={user.avatar} alt={user.name} />
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {editMode ? (
        <UserEditForm user={user} onClose={() => setEditMode(false)} />
      ) : (
        <button onClick={() => setEditMode(true)}>Edit Profile</button>
      )}
    </div>
  );
}

// 子组件 2: 订单列表
function UserOrders({ userId }: { userId: string }) {
  const orders = useOrders(userId);

  return (
    <section className="orders">
      <h2>Your Orders</h2>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </section>
  );
}

// 子组件 3: 订单卡片
function OrderCard({ order }: { order: Order }) {
  return (
    <div className="order-card">
      <p>Order #{order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total}</p>
    </div>
  );
}
```

**改进点**：
- 每个组件职责单一，易于理解
- 数据获取逻辑提取为自定义 Hook
- 组件易于测试和复用
- 修改某个功能不影响其他部分

---

## 案例 6: 异步代码简化（错误处理优化）

### 场景
API 调用，包含复杂的错误处理和重试逻辑。

### 优化前 ❌
```javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      if (response.status === 404) {
        throw new Error('User not found');
      } else if (response.status === 500) {
        throw new Error('Server error');
      } else {
        throw new Error('Unknown error');
      }
    }
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      console.error('Network error');
      return null;
    } else {
      console.error(error.message);
      return null;
    }
  }
}
```

**问题**：
- 嵌套的 if-else 错误处理
- 错误消息硬编码
- 无法区分不同类型的错误

### 优化后 ✅
```javascript
// 错误类型定义
class ApiError extends Error {
  constructor(message, status, isNetworkError = false) {
    super(message);
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.name = 'ApiError';
  }
}

const HTTP_ERROR_MESSAGES = {
  404: 'User not found',
  500: 'Server error',
  default: 'An unexpected error occurred'
};

async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      const message =
        HTTP_ERROR_MESSAGES[response.status] ||
        HTTP_ERROR_MESSAGES.default;
      throw new ApiError(message, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error (${error.status}): ${error.message}`);
      throw error; // 让调用者决定如何处理
    }

    // 网络错误
    const networkError = new ApiError(
      'Network connection failed',
      0,
      true
    );
    console.error('Network Error:', error);
    throw networkError;
  }
}

// 使用示例：调用者可以根据错误类型采取不同行动
async function loadUserProfile(userId) {
  try {
    const user = await fetchUserData(userId);
    displayUser(user);
  } catch (error) {
    if (error.status === 404) {
      showMessage('用户不存在');
    } else if (error.isNetworkError) {
      showMessage('网络连接失败，请检查网络');
    } else {
      showMessage('加载失败，请稍后重试');
    }
  }
}
```

**改进点**：
- 自定义错误类，携带更多上下文信息
- 错误消息集中管理，易于国际化
- 提前返回成功结果，减少嵌套
- 区分不同错误类型，便于针对性处理
- 将错误处理责任上移到调用者

---

## 总结

这 6 个案例覆盖了常见的代码简化场景：

1. **减少嵌套** - 使用 guard clauses
2. **消除冗余** - 简化布尔逻辑
3. **改进命名** - 有意义的变量和常量
4. **对象映射** - 替换复杂三元表达式
5. **组件拆分** - React 单一职责
6. **错误处理** - 结构化异步代码

每个案例都展示了：
- **优化前的问题**
- **优化后的改进**
- **具体的改进点**

使用 Code Simplifier 时，参考这些模式可以快速识别和解决类似的代码质量问题！

## 练习建议

1. **识别模式**: 在你的代码库中寻找类似的反模式
2. **小步重构**: 每次只优化一个问题，保持功能不变
3. **运行测试**: 每次改动后验证功能一致性
4. **团队讨论**: 将优化模式分享给团队

Happy Simplifying! 🚀
