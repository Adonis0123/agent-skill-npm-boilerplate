# Mermaid 图表语法参考

## 流程图 (Flowchart)

### 基本语法

```mermaid
graph TB
    A[矩形节点] --> B(圆角矩形)
    B --> C{菱形判断}
    C -->|是| D[结果1]
    C -->|否| E[结果2]
```

### 方向

- `TB` / `TD` - 从上到下
- `BT` - 从下到上
- `LR` - 从左到右
- `RL` - 从右到左

### 节点形状

```mermaid
graph LR
    A[矩形] --> B(圆角矩形)
    B --> C([体育场形])
    C --> D[[子程序]]
    D --> E[(数据库)]
    E --> F((圆形))
    F --> G>旗帜形]
    G --> H{菱形}
    H --> I{{六边形}}
    I --> J[/平行四边形/]
```

### 连接线样式

```mermaid
graph LR
    A --> B
    A --- C
    A -.- D
    A -.-> E
    A ==> F
    A --文字--> G
    A -.文字.-> H
```

## 时序图 (Sequence Diagram)

### 基本语法

```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 服务器
    participant C as 数据库

    A->>B: 请求数据
    B->>C: 查询
    C-->>B: 返回结果
    B-->>A: 响应
```

### 消息类型

- `->` 实线无箭头
- `-->` 虚线无箭头
- `->>` 实线有箭头
- `-->>` 虚线有箭头
- `-x` 实线带 x
- `--x` 虚线带 x

### 激活框

```mermaid
sequenceDiagram
    participant A as Client
    participant B as Server

    A->>+B: 请求
    B->>+B: 处理
    B-->>-B: 完成
    B-->>-A: 响应
```

## 类图 (Class Diagram)

### 基本语法

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog
```

### 关系类型

- `<|--` 继承
- `*--` 组合
- `o--` 聚合
- `-->` 关联
- `--` 链接
- `..>` 依赖
- `..|>` 实现

### 可见性

- `+` Public
- `-` Private
- `#` Protected
- `~` Package/Internal

## 状态图 (State Diagram)

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: start
    Processing --> Success: complete
    Processing --> Error: fail
    Success --> [*]
    Error --> Idle: retry
```

## 实体关系图 (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "ordered in"

    USER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        int user_id FK
        date created_at
    }
```

## 饼图 (Pie Chart)

```mermaid
pie title 项目语言分布
    "JavaScript" : 45
    "TypeScript" : 30
    "CSS" : 15
    "Other" : 10
```

## 架构图示例

### Web 应用架构

```mermaid
graph TB
    subgraph Frontend
        A[React App]
    end
    subgraph Backend
        B[API Server]
        C[Auth Service]
    end
    subgraph Database
        D[(PostgreSQL)]
        E[(Redis Cache)]
    end

    A --> B
    A --> C
    B --> D
    B --> E
    C --> D
```

### 微服务架构

```mermaid
graph LR
    subgraph Gateway
        A[API Gateway]
    end
    subgraph Services
        B[User Service]
        C[Order Service]
        D[Payment Service]
    end
    subgraph Data
        E[(User DB)]
        F[(Order DB)]
        G[Message Queue]
    end

    A --> B
    A --> C
    A --> D
    B --> E
    C --> F
    C --> G
    D --> G
```

