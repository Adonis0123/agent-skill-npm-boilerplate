"""Git 分析器模块

提供 Git 仓库提交记录分析功能。
"""

import re
import subprocess
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional


# 提交类型配置
COMMIT_TYPE_CONFIG = {
    "feat": {"label": "[新功能]", "priority": 1, "is_highlight": True, "is_challenge": False},
    "fix": {"label": "[修复]", "priority": 2, "is_highlight": False, "is_challenge": True},
    "refactor": {"label": "[优化]", "priority": 3, "is_highlight": False, "is_challenge": False},
    "perf": {"label": "[性能]", "priority": 3, "is_highlight": True, "is_challenge": False},
    "style": {"label": "[样式]", "priority": 6, "is_highlight": False, "is_challenge": False},
    "docs": {"label": "[文档]", "priority": 5, "is_highlight": False, "is_challenge": False},
    "test": {"label": "[测试]", "priority": 4, "is_highlight": False, "is_challenge": False},
    "chore": {"label": "[杂项]", "priority": 6, "is_highlight": False, "is_challenge": False},
    "build": {"label": "[构建]", "priority": 4, "is_highlight": False, "is_challenge": False},
    "ci": {"label": "[CI]", "priority": 5, "is_highlight": False, "is_challenge": False},
    "other": {"label": "", "priority": 7, "is_highlight": False, "is_challenge": False},
}


# 琐碎提交的关键词
TRIVIAL_PATTERNS = [
    # 现有规则
    r"^fix\s*typo",
    r"^typo",
    r"^update\s*(readme|changelog)",
    r"^merge\s+branch",
    r"^merge\s+pull\s+request",
    r"^wip$",
    r"^wip:",
    r"^format",
    r"^lint",
    r"^style:",
    # 新增 - 明确琐碎的文档维护
    r"完善.*文档$",
    r"更新.*文档$",
    r"^docs:.*typo",
    r"^docs:.*fix\s*typo",
    # 新增 - 代码清理相关
    r"^代码清理$",
    r"^清理.*代码$",
    r"^chore:.*clean",
    r"^chore:.*cleanup",
    # 新增 - 调试和日志移除
    r"移除.*调试",
    r"删除.*调试",
    r"移除.*日志$",
    r"删除.*日志$",
    r"^chore:.*log$",
    r"^chore:.*debug",
    # 新增 - 纯样式调整
    r"^样式调整$",
    r"^调整.*样式$",
    r"^style:.*调整",
]


def get_git_user(repo_path: Path) -> Optional[str]:
    """获取 Git 用户名

    Args:
        repo_path: 仓库路径

    Returns:
        用户名，未配置时返回 None
    """
    try:
        result = subprocess.run(
            ["git", "config", "user.name"],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        return None
    except Exception:
        return None


def get_git_user_email(repo_path: Path) -> Optional[str]:
    """获取 Git 用户邮箱

    Args:
        repo_path: 仓库路径

    Returns:
        邮箱，未配置时返回 None
    """
    try:
        result = subprocess.run(
            ["git", "config", "user.email"],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        return None
    except Exception:
        return None


def _escape_git_author_pattern(value: str) -> str:
    # git log --author 使用正则匹配；这里做最小转义，避免邮箱/括号等字符影响匹配。
    return re.sub(r"([\\.^$|?*+()[\]{}])", r"\\\1", value)


def build_author_pattern(
    user_name: Optional[str],
    user_email: Optional[str],
) -> Optional[str]:
    """构建 git log --author 的匹配模式（name/email 任一匹配即视为本人）"""
    parts: List[str] = []
    if user_name and user_name.strip():
        parts.append(_escape_git_author_pattern(user_name.strip()))
    if user_email and user_email.strip():
        parts.append(_escape_git_author_pattern(user_email.strip()))

    if not parts:
        return None
    if len(parts) == 1:
        return parts[0]
    return "(" + "|".join(parts) + ")"


def analyze_commit_diff(repo_path: Path, commit_hash: str) -> Dict[str, Any]:
    """分析提交的 diff 统计

    Args:
        repo_path: 仓库路径
        commit_hash: 提交哈希

    Returns:
        {
            "files_changed": 5,
            "insertions": 120,
            "deletions": 30,
            "total_changes": 150,
            "is_small_change": False  # <10 行变更
        }
    """
    try:
        result = subprocess.run(
            ["git", "show", "--stat", "--format=", commit_hash],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            return {
                "files_changed": 0,
                "insertions": 0,
                "deletions": 0,
                "total_changes": 0,
                "is_small_change": False,
            }

        # 解析统计行，例如: "3 files changed, 120 insertions(+), 30 deletions(-)"
        lines = result.stdout.strip().split("\n")
        stats_line = lines[-1] if lines else ""

        files = 0
        insertions = 0
        deletions = 0

        # 提取数字
        if "file" in stats_line:
            match = re.search(r"(\d+)\s+file", stats_line)
            if match:
                files = int(match.group(1))

        if "insertion" in stats_line:
            match = re.search(r"(\d+)\s+insertion", stats_line)
            if match:
                insertions = int(match.group(1))

        if "deletion" in stats_line:
            match = re.search(r"(\d+)\s+deletion", stats_line)
            if match:
                deletions = int(match.group(1))

        total = insertions + deletions

        return {
            "files_changed": files,
            "insertions": insertions,
            "deletions": deletions,
            "total_changes": total,
            "is_small_change": total < 10,  # 适度过滤：<10 行为小变更
        }
    except Exception:
        return {
            "files_changed": 0,
            "insertions": 0,
            "deletions": 0,
            "total_changes": 0,
            "is_small_change": False,
        }


def is_trivial_file_change(repo_path: Path, commit_hash: str) -> bool:
    """判断提交是否仅修改琐碎文件

    琐碎文件包括：
    - package-lock.json, yarn.lock, pnpm-lock.yaml
    - .gitignore, .editorconfig, .prettierrc

    Args:
        repo_path: 仓库路径
        commit_hash: 提交哈希

    Returns:
        是否为琐碎文件变更
    """
    try:
        result = subprocess.run(
            ["git", "show", "--name-only", "--format=", commit_hash],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            return False

        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]

        if not files:
            return False

        trivial_files = {
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            ".gitignore",
            ".editorconfig",
            ".prettierrc",
            ".prettierignore",
        }

        # 如果所有文件都是琐碎文件，返回 True
        return all(f in trivial_files for f in files)

    except Exception:
        return False


def get_commits(
    repo_path: Path,
    start_date: date,
    end_date: date,
    author: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """获取指定日期范围内的提交记录

    Args:
        repo_path: 仓库路径
        start_date: 开始日期
        end_date: 结束日期
        author: 作者名（可选）

    Returns:
        提交记录列表
    """
    # git log 的 --until=YYYY-MM-DD 会被解析为当天 00:00:00，
    # 可能导致“结束日当天”的提交被排除；这里将截止时间调整到下一天 00:00。
    end_date_exclusive = end_date + timedelta(days=1)

    # 构建 git log 命令
    cmd = [
        "git",
        "log",
        "--all",
        f"--since={start_date.isoformat()}",
        f"--until={end_date_exclusive.isoformat()}",
        "--pretty=format:%H|%s|%an|%ad",
        "--date=short",
    ]

    if author:
        cmd.append(f"--author={author}")

    try:
        result = subprocess.run(
            cmd,
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0 or not result.stdout.strip():
            return []

        commits = []
        for line in result.stdout.strip().split("\n"):
            if not line:
                continue

            parts = line.split("|")
            if len(parts) >= 4:
                commit_hash = parts[0]
                message = parts[1]

                # 解析提交信息
                parsed = parse_commit_message(message)

                # 添加 diff 分析
                diff_stats = analyze_commit_diff(repo_path, commit_hash)
                trivial_file = is_trivial_file_change(repo_path, commit_hash)

                # 基于 diff 判断是否琐碎
                if diff_stats["is_small_change"] or trivial_file:
                    parsed["is_trivial"] = True

                commits.append({
                    "hash": commit_hash,
                    "message": message,
                    "author": parts[2],
                    "date": parts[3],
                    "type": parsed["type"],
                    "is_trivial": parsed["is_trivial"],
                    "is_highlight": parsed["is_highlight"],
                    "is_challenge": parsed["is_challenge"],
                    "label": parsed["label"],
                    "priority": parsed["priority"],
                    "project": get_repo_name(repo_path),
                    "diff_stats": diff_stats,
                })

        return commits
    except Exception:
        return []


def group_commits_by_project(
    commits: List[Dict[str, Any]]
) -> Dict[str, List[Dict[str, Any]]]:
    """按项目分组提交记录

    Args:
        commits: 提交记录列表

    Returns:
        按项目分组的提交记录字典
    """
    grouped: Dict[str, List[Dict[str, Any]]] = {}

    for commit in commits:
        project = commit.get("project", "unknown")
        if project not in grouped:
            grouped[project] = []
        grouped[project].append(commit)

    return grouped


def parse_commit_message(message: str) -> Dict[str, Any]:
    """解析提交信息

    Args:
        message: 提交信息

    Returns:
        解析后的提交信息字典，包含：
        - type: 提交类型
        - scope: 作用域
        - description: 描述
        - is_trivial: 是否为琐碎提交
        - is_highlight: 是否为重点（feat/perf 类型）
        - is_challenge: 是否为难点（fix 类型）
        - label: 类型标签（如 [新功能]）
        - priority: 优先级（用于排序）
    """
    result = {
        "type": "other",
        "scope": None,
        "description": message,
        "is_trivial": False,
        "is_highlight": False,
        "is_challenge": False,
        "label": "",
        "priority": 7,
    }

    # 检查是否为琐碎提交
    message_lower = message.lower().strip()
    for pattern in TRIVIAL_PATTERNS:
        if re.match(pattern, message_lower, re.IGNORECASE):
            result["is_trivial"] = True
            break

    # 解析常规提交格式: type(scope): description
    conventional_pattern = r"^(\w+)(?:\(([^)]+)\))?\s*:\s*(.+)$"
    match = re.match(conventional_pattern, message)

    if match:
        commit_type = match.group(1).lower()
        result["type"] = commit_type
        result["scope"] = match.group(2)
        result["description"] = match.group(3)
    else:
        result["description"] = message
        commit_type = "other"

    # 从配置中获取类型属性
    type_config = COMMIT_TYPE_CONFIG.get(commit_type, COMMIT_TYPE_CONFIG["other"])
    result["is_highlight"] = type_config["is_highlight"]
    result["is_challenge"] = type_config["is_challenge"]
    result["label"] = type_config["label"]
    result["priority"] = type_config["priority"]

    return result


def is_git_repo(path: Path) -> bool:
    """检查路径是否为 Git 仓库

    Args:
        path: 路径

    Returns:
        是否为 Git 仓库
    """
    git_dir = path / ".git"
    return git_dir.exists() and git_dir.is_dir()


def get_repo_name(repo_path: Path) -> str:
    """获取仓库名称

    Args:
        repo_path: 仓库路径

    Returns:
        仓库名称
    """
    return repo_path.name


def scan_repos(
    repo_paths: List[Path],
) -> List[Dict[str, Any]]:
    """扫描多个仓库

    Args:
        repo_paths: 仓库路径列表

    Returns:
        有效仓库信息列表
    """
    repos = []

    for path in repo_paths:
        if isinstance(path, str):
            path = Path(path)

        if is_git_repo(path):
            repos.append({
                "path": path,
                "name": get_repo_name(path),
            })

    return repos


def merge_commits_from_repos(
    commits_by_repo: Dict[str, List[Dict[str, Any]]]
) -> List[Dict[str, Any]]:
    """合并多仓库提交记录

    Args:
        commits_by_repo: 按仓库分组的提交记录

    Returns:
        合并后的提交记录列表
    """
    merged = []

    for repo_name, commits in commits_by_repo.items():
        for commit in commits:
            # 确保每个提交都有 project 字段
            if "project" not in commit:
                commit["project"] = repo_name
            merged.append(commit)

    # 按日期排序
    merged.sort(key=lambda x: x.get("date", ""), reverse=True)

    return merged


def get_all_commits_from_repos(
    repo_paths: List[Path],
    start_date: date,
    end_date: date,
    author: Optional[str] = None,
) -> Dict[str, List[Dict[str, Any]]]:
    """从多个仓库获取提交记录

    Args:
        repo_paths: 仓库路径列表
        start_date: 开始日期
        end_date: 结束日期
        author: 作者名（可选，None 表示自动获取）

    Returns:
        按仓库分组的提交记录
    """
    commits_by_repo: Dict[str, List[Dict[str, Any]]] = {}

    for path in repo_paths:
        if isinstance(path, str):
            path = Path(path)

        if not is_git_repo(path):
            continue

        # 如果没有指定作者，自动获取
        current_author = author
        if current_author is None:
            current_author = build_author_pattern(
                user_name=get_git_user(path),
                user_email=get_git_user_email(path),
            )

        repo_name = get_repo_name(path)
        commits = get_commits(path, start_date, end_date, current_author)

        if commits:
            commits_by_repo[repo_name] = commits

    return commits_by_repo
