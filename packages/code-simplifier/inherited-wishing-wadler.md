# Claude Code PostToolUse 钩子配置指南

## 一、PostToolUse 钩子介绍

### 什么是 PostToolUse？

PostToolUse 是 Claude Code 提供的一种**事件钩子**机制，在 Claude 每次使用工具（如 Edit、Write、Read、Bash 等）**之后**自动触发执行指定的命令或操作。

### 钩子类型概览

Claude Code 支持多种钩子类型：

1. **PreToolUse** - 工具使用前触发
2. **PostToolUse** - 工具使用后触发 ⭐ 你关注的重点
3. **UserPromptSubmit** - 用户提交提示词后触发
4. **PreCompact** - 压缩上下文前触发
5. **SessionEnd** - 会话结束时触发
6. **Stop** - 停止时触发
7. **SubagentStop** - 子代理停止时触发

### PostToolUse 的工作原理

```
用户请求 → Claude 执行工具 → 工具执行完成 → PostToolUse 钩子触发 → 执行配置的命令
```

### 当前配置分析

你的 settings.json 中已经配置了 PostToolUse 钩子：

```json
"PostToolUse": [
  {
    "hooks": [
      {
        "command": "claude-code-wakatime",
        "type": "command"
      }
    ],
    "matcher": "*"
  }
]
```

**配置说明：**
- `matcher: "*"` - 匹配所有工具调用
- `type: "command"` - 执行命令类型的钩子
- `command: "claude-code-wakatime"` - 执行 wakatime 插件（用于时间追踪）

---

## 二、添加 code-simplifier 自动检查

### 需求分析

你想要在每次生成代码后自动运行 code-simplifier skill 来检查代码质量。

### 配置方案

有两种主要方案：

#### **方案一：仅在代码编辑工具后触发（推荐）**

只在使用 `Edit` 或 `Write` 工具后触发 code-simplifier，避免在读取文件、执行 bash 命令时也触发。

```json
"PostToolUse": [
  {
    "hooks": [
      {
        "command": "claude-code-wakatime",
        "type": "command"
      }
    ],
    "matcher": "*"
  },
  {
    "hooks": [
      {
        "command": "echo '🔍 正在运行 code-simplifier 检查...'",
        "type": "shell"
      }
    ],
    "matcher": "Edit|Write"
  }
]
```

**说明：**
- `matcher: "Edit|Write"` - 仅匹配 Edit 和 Write 工具
- 使用 shell 类型执行提示命令
- 可以添加实际的 code-simplifier 调用

#### **方案二：所有工具后都触发**

```json
"PostToolUse": [
  {
    "hooks": [
      {
        "command": "claude-code-wakatime",
        "type": "command"
      },
      {
        "command": "echo '✅ 工具执行完成，可以运行 code-simplifier'",
        "type": "shell"
      }
    ],
    "matcher": "*"
  }
]
```

### ⚠️ 重要限制

**PostToolUse 钩子无法直接调用 Claude Code skills**

因为 skills（如 code-simplifier）是 Claude 内部的功能，不是可以通过 shell 执行的外部命令。钩子只能执行：
- Shell 命令（如 `echo`, `git`, `npm`）
- 外部脚本
- MCP 服务器命令

### 替代方案：手动工作流

由于技术限制，建议采用以下工作流：

1. **配置提醒钩子** - 在代码编辑后提醒你运行检查
2. **手动调用 skill** - 看到提醒后手动运行 `/code-simplifier`

配置示例：

```json
"PostToolUse": [
  {
    "hooks": [
      {
        "command": "claude-code-wakatime",
        "type": "command"
      }
    ],
    "matcher": "*"
  },
  {
    "hooks": [
      {
        "command": "echo '\n📝 代码已修改，建议运行: /code-simplifier 进行质量检查\n'",
        "type": "shell"
      }
    ],
    "matcher": "Edit|Write"
  }
]
```

---

## 三、完整配置示例

### 推荐的最终配置

```json
{
  "alwaysThinkingEnabled": true,
  "enabledPlugins": {
    "claude-code-wakatime@wakatime": true
  },
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-ant-oat01-...",
    "ANTHROPIC_BASE_URL": "https://code.newcli.com/claude/ultra",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "command": "claude-code-wakatime",
            "type": "command"
          }
        ],
        "matcher": "*"
      },
      {
        "hooks": [
          {
            "command": "echo '\n🔍 代码已更新！建议运行 /code-simplifier 检查代码质量\n'",
            "type": "shell"
          }
        ],
        "matcher": "Edit|Write"
      }
    ],
    "PreCompact": [...],
    "PreToolUse": [...],
    "SessionEnd": [...],
    "Stop": [...],
    "SubagentStop": [...],
    "UserPromptSubmit": [...]
  },
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

---

## 四、高级选项：创建自动化脚本

如果你想要更自动化的流程，可以创建一个脚本来解析修改的文件并生成检查建议：

### 创建检查脚本

```bash
#!/bin/bash
# ~/.claude/scripts/check-code.sh

# 获取最近修改的文件
MODIFIED_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx|js|jsx)$')

if [ -n "$MODIFIED_FILES" ]; then
  echo ""
  echo "🔍 检测到以下文件已修改："
  echo "$MODIFIED_FILES" | sed 's/^/  - /'
  echo ""
  echo "💡 建议运行: /code-simplifier 进行代码质量检查"
  echo ""
fi
```

### 在钩子中调用脚本

```json
{
  "hooks": [
    {
      "command": "bash ~/.claude/scripts/check-code.sh",
      "type": "shell"
    }
  ],
  "matcher": "Edit|Write"
}
```

---

## 五、总结与建议

### 关键要点

1. ✅ PostToolUse 可以在工具使用后自动执行 shell 命令
2. ❌ PostToolUse 无法直接调用 Claude Code skills
3. ✅ 可以用钩子显示提醒消息，引导手动运行 skill
4. ✅ 使用 `matcher` 精确控制哪些工具触发钩子

### 推荐工作流

1. **配置提醒钩子** - 在 Edit/Write 后显示提醒
2. **手动运行检查** - 看到提醒后运行 `/code-simplifier`
3. **建立习惯** - 养成代码修改后检查的习惯

---

## 六、具体实施方案（用户已选择：添加提醒钩子）

### 配置步骤

#### 1. 修改 settings.json 中的 PostToolUse 配置

在 `/Users/adonis/.claude/settings.json` 的 `PostToolUse` 数组中添加新的钩子配置：

**修改前：**
```json
"PostToolUse": [
  {
    "hooks": [
      {
        "command": "claude-code-wakatime",
        "type": "command"
      }
    ],
    "matcher": "*"
  }
]
```

**修改后：**
```json
"PostToolUse": [
  {
    "hooks": [
      {
        "command": "claude-code-wakatime",
        "type": "command"
      }
    ],
    "matcher": "*"
  },
  {
    "hooks": [
      {
        "command": "echo '\n🔍 代码已修改！建议运行 /code-simplifier 检查代码质量\n'",
        "type": "shell"
      }
    ],
    "matcher": "Edit|Write"
  }
]
```

#### 2. 工作原理

- 当 Claude 使用 `Edit` 或 `Write` 工具修改代码后
- 钩子自动执行 `echo` 命令
- 在终端显示友好的提醒消息
- 提示你手动运行 `/code-simplifier` 进行代码检查

#### 3. 预期效果

每次代码修改后，你会在终端看到：

```
🔍 代码已修改！建议运行 /code-simplifier 检查代码质量
```

这时你可以：
- 输入 `/code-simplifier` 运行代码质量检查
- 或者继续其他工作，稍后再检查

### 关键文件

- **配置文件：** `/Users/adonis/.claude/settings.json`
- **修改位置：** `hooks.PostToolUse` 数组
- **影响范围：** 仅 Edit 和 Write 工具

### 验证方法

配置完成后，可以通过以下步骤验证：
1. 用 Claude 修改任意代码文件
2. 观察终端是否显示提醒消息
3. 手动运行 `/code-simplifier` 测试功能
