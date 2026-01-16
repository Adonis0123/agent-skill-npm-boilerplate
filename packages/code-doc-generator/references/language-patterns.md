# 语言特定分析模式

## JavaScript / TypeScript

### 项目识别

**配置文件:**
- `package.json` - 项目元数据和依赖
- `tsconfig.json` - TypeScript 配置
- `vite.config.js` / `webpack.config.js` - 构建工具
- `.eslintrc` / `.prettierrc` - 代码规范

**框架检测:**

| 框架 | 识别特征 |
|------|----------|
| React | `react`, `react-dom` 依赖 |
| Next.js | `next` 依赖, `next.config.js` |
| Vue | `vue` 依赖, `.vue` 文件 |
| Express | `express` 依赖 |
| NestJS | `@nestjs/core` 依赖 |

### 常见项目结构

```
src/
├── components/     # UI 组件
├── pages/          # 页面组件
├── hooks/          # 自定义 Hooks
├── services/       # API 服务
├── utils/          # 工具函数
├── types/          # TypeScript 类型
└── index.ts        # 入口文件
```

### 入口点识别

- `package.json` 中的 `main`, `module`, `exports`
- `src/index.ts` 或 `src/main.ts`
- Next.js: `pages/_app.tsx`, `app/layout.tsx`

## Python

### 项目识别

**配置文件:**
- `requirements.txt` - 依赖列表
- `pyproject.toml` - 现代项目配置
- `setup.py` - 传统包配置
- `Pipfile` - Pipenv 配置

**框架检测:**

| 框架 | 识别特征 |
|------|----------|
| Django | `django` 依赖, `manage.py` |
| Flask | `flask` 依赖 |
| FastAPI | `fastapi` 依赖 |
| Pytest | `pytest` 依赖, `conftest.py` |

### 常见项目结构

```
project/
├── src/
│   └── package_name/
│       ├── __init__.py
│       ├── main.py
│       └── models/
├── tests/
├── docs/
├── pyproject.toml
└── README.md
```

### 入口点识别

- `__main__.py` 模块
- `if __name__ == "__main__":` 块
- Django: `manage.py`, `wsgi.py`
- FastAPI: `main.py` 中的 `app = FastAPI()`

## Java

### 项目识别

**配置文件:**
- `pom.xml` - Maven 项目
- `build.gradle` - Gradle 项目
- `settings.gradle` - Gradle 多模块

**框架检测:**

| 框架 | 识别特征 |
|------|----------|
| Spring Boot | `spring-boot-starter` 依赖 |
| Spring MVC | `spring-webmvc` 依赖 |
| Quarkus | `quarkus` 依赖 |

### 常见项目结构

```
src/
├── main/
│   ├── java/
│   │   └── com/example/
│   │       ├── Application.java
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       └── model/
│   └── resources/
│       └── application.yml
└── test/
```

### 入口点识别

- `@SpringBootApplication` 注解的类
- `public static void main(String[] args)` 方法

## Go

### 项目识别

**配置文件:**
- `go.mod` - 模块定义
- `go.sum` - 依赖校验
- `Makefile` - 构建脚本

**框架检测:**

| 框架 | 识别特征 |
|------|----------|
| Gin | `github.com/gin-gonic/gin` |
| Echo | `github.com/labstack/echo` |
| Fiber | `github.com/gofiber/fiber` |

### 常见项目结构

```
project/
├── cmd/
│   └── app/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
├── go.mod
└── README.md
```

### 入口点识别

- `cmd/*/main.go`
- `func main()` 函数
- `package main` 声明

## 通用分析模式

### 依赖分析

1. 读取配置文件获取依赖列表
2. 分析 import/require 语句
3. 构建依赖关系图

### 架构识别

| 模式 | 特征 |
|------|------|
| MVC | controller/, model/, view/ |
| 分层架构 | handler/, service/, repository/ |
| 微服务 | 多个独立服务目录 |
| Monorepo | packages/, apps/ |

