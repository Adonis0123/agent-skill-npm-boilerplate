## Staged-Specific Additions (staged-simplifier)

下面内容是对 **code-simplifier** 的“Git 暂存区特化扩展”。当 `staged-simplifier` 安装时，会优先复用本地已有的 `code-simplifier/SKILL.md` 作为主体，并把此扩展段落附加进去，以减少重复维护、自动跟随上游更新。

### 核心差异
- **优化范围**：仅处理 `git add` 后处于暂存区（staging area）的文件，不触碰未暂存文件。
- **建议粒度**：优先围绕“即将提交的改动”给出可落地的改进建议，避免扩散性重构。
- **Git 工作流**：默认在 `git add` 之后、`git commit` 之前运行。

### 推荐操作步骤
1. 获取暂存文件列表：`git diff --cached --name-only`
2. 仅对代码文件做优化（跳过图片、锁文件、构建产物等）
3. 优先优化“本次提交改动附近”的代码（保持小而安全）
4. 必要时提示用户：优化后重新 `git add` 以更新暂存内容

### 参考资料
- `references/`：staged-simplifier 自带的工作流与最佳实践
- `references/code-simplifier/`：复用到的 code-simplifier 参考资料（安装时复制）
