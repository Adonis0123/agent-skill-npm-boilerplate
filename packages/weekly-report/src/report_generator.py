"""周报生成器模块

根据 Git 提交记录生成结构化周报。
"""

import re
from typing import Any, Dict, List, Optional

from src.git_analyzer import group_commits_by_project, COMMIT_TYPE_CONFIG


# 琐碎细节关键词列表
TRIVIAL_DETAIL_KEYWORDS = [
    "完善",
    "更新文档",
    "调整样式",
    "优化格式",
    "移除日志",
    "删除调试",
    "代码清理",
    "清理代码",
    "移除调试",
    "删除日志",
]


def is_trivial_detail(detail: str) -> bool:
    """判断细节是否琐碎（适度过滤）

    Args:
        detail: 细节描述

    Returns:
        是否为琐碎细节
    """
    detail_stripped = detail.strip()

    # 完全匹配琐碎关键词
    if detail_stripped in ["完善相关文档", "代码清理", "样式优化"]:
        return True

    # 包含琐碎关键词，但描述过短（<8 字）
    if len(detail_stripped) < 8:
        for kw in TRIVIAL_DETAIL_KEYWORDS:
            if kw in detail_stripped:
                return True

    return False


def generate_report(
    commits: List[Dict[str, Any]],
    supplements: Optional[List[str]] = None,
) -> str:
    """生成周报

    Args:
        commits: 提交记录列表
        supplements: 补充内容列表

    Returns:
        Markdown 格式的周报内容
    """
    if not commits and not supplements:
        return ""

    # 过滤琐碎提交
    filtered_commits = filter_trivial_commits(commits)

    # 按项目分组
    grouped = group_commits_by_project(filtered_commits)

    # 生成周报内容
    sections = []

    # 按项目生成各部分
    for project, project_commits in sorted(grouped.items()):
        # 合并相关提交
        merged = merge_related_commits(project_commits)
        section = format_project_section(project, merged)
        sections.append(section)

    # 添加"其他"部分（补充内容）
    if supplements:
        other_section = format_other_section(supplements)
        sections.append(other_section)

    return "\n\n".join(sections)


def filter_trivial_commits(
    commits: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """过滤琐碎提交

    过滤规则：
    - typo 修复
    - 纯格式化/lint 调整
    - merge 提交
    - WIP 提交

    Args:
        commits: 提交记录列表

    Returns:
        过滤后的提交列表
    """
    return [c for c in commits if not c.get("is_trivial", False)]


def merge_related_commits(
    commits: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """合并相关提交

    合并规则：
    1. 先按 commit 类型分组（feat/fix/docs 分开）
    2. 再按关键词合并相似提交
    3. 按类型优先级排序输出

    Args:
        commits: 提交记录列表

    Returns:
        合并后的提交列表
    """
    if not commits:
        return []
    if len(commits) <= 1:
        single = commits[0].copy()
        single.setdefault("details", [])
        single.setdefault("commit_count", 1)
        return [single]

    # 第一步：按类型分组
    type_groups: Dict[str, List[Dict[str, Any]]] = {}
    for commit in commits:
        commit_type = commit.get("type", "other")
        if commit_type not in type_groups:
            type_groups[commit_type] = []
        type_groups[commit_type].append(commit)

    # 第二步：在每个类型组内按关键词合并
    merged: List[Dict[str, Any]] = []

    for commit_type, type_commits in type_groups.items():
        # 按关键词分组
        keyword_groups: Dict[str, List[Dict[str, Any]]] = {}

        for commit in type_commits:
            keywords = extract_keywords(commit["message"])
            str_key = str(sorted(keywords)) if keywords else commit["message"]

            if str_key not in keyword_groups:
                keyword_groups[str_key] = []
            keyword_groups[str_key].append(commit)

        # 合并同组提交
        for group_commits in keyword_groups.values():
            main_commit = group_commits[0].copy()
            # 优先选择 feat 类型作为主条目
            for c in group_commits:
                if c.get("type") == "feat":
                    main_commit = c.copy()
                    break

            details = []
            for c in group_commits:
                details.append(clean_commit_message(c.get("message", "")))

            # 去重并保持顺序，同时过滤琐碎细节
            seen = set()
            uniq_details = []
            for d in details:
                key = d.strip()
                # 过滤空内容、重复内容、琐碎细节
                if not key or key in seen or is_trivial_detail(d):
                    continue
                seen.add(key)
                uniq_details.append(d.strip())

            main_commit["details"] = uniq_details if len(uniq_details) > 1 else []
            main_commit["commit_count"] = len(group_commits)
            merged.append(main_commit)

    # 第三步：按优先级排序（优先级数字越小越靠前）
    merged.sort(key=lambda x: (x.get("priority", 7), x.get("message", "")))

    return merged


def extract_keywords(message: str) -> List[str]:
    """从提交信息中提取关键词

    Args:
        message: 提交信息

    Returns:
        关键词列表
    """
    # 去除前缀
    cleaned = re.sub(r"^(\w+)(\([^)]+\))?\s*:\s*", "", message)

    # 提取中文词语和英文单词
    chinese_words = re.findall(r"[\u4e00-\u9fff]+", cleaned)
    english_words = re.findall(r"[a-zA-Z]{3,}", cleaned)

    keywords = chinese_words + [w.lower() for w in english_words]

    # 过滤常见无意义词
    stop_words = {"the", "and", "for", "with", "this", "that", "from", "into"}
    keywords = [k for k in keywords if k.lower() not in stop_words]

    return keywords[:3]  # 只保留前3个关键词


def clean_commit_message(message: str) -> str:
    """清理提交信息为可读描述（去除 conventional 前缀）"""
    return re.sub(r"^(\w+)(\([^)]+\))?\s*:\s*", "", message).strip()


def analyze_work_significance(commit: Dict[str, Any]) -> Dict[str, bool]:
    """分析工作的重点和难点

    判断规则：
    - 重点：feat 类型 + 多次迭代（>=2次提交）或显式标记 is_highlight
    - 难点：fix 类型 + 多次尝试（>=2次提交）或显式标记 is_challenge

    Args:
        commit: 提交记录（合并后的，含 commit_count）

    Returns:
        包含 is_highlight 和 is_challenge 的字典
    """
    commit_count = commit.get("commit_count", 1)
    commit_type = commit.get("type", "other")

    # 判断是否为重点
    is_highlight = commit.get("is_highlight", False)
    if commit_type == "feat" and commit_count >= 2:
        is_highlight = True
    if commit_type == "perf":
        is_highlight = True

    # 判断是否为难点
    is_challenge = commit.get("is_challenge", False)
    if commit_type == "fix" and commit_count >= 2:
        is_challenge = True

    return {
        "is_highlight": is_highlight,
        "is_challenge": is_challenge,
    }


def format_project_section(
    project: str,
    commits: List[Dict[str, Any]],
) -> str:
    """格式化项目部分

    重点/难点通过以下方式体现（而非显式标记）：
    - 重点工作：摘要字数更长（max_length=40），保留更多细节
    - 难点工作：保留更多子条目细节
    - 普通工作：简洁摘要（max_length=25）

    Args:
        project: 项目名称
        commits: 提交记录列表

    Returns:
        格式化的 Markdown 内容
    """
    lines = [project]

    for commit in commits:
        # 获取类型标签
        label = commit.get("label", "")

        # 分析重点/难点
        significance = analyze_work_significance(commit)

        # 根据重要程度调整摘要长度
        if significance["is_highlight"]:
            # 重点工作：更长的摘要
            max_len = 30  # 从 40 减到 30
        elif significance["is_challenge"]:
            # 难点工作：适中的摘要
            max_len = 25  # 从 35 减到 25
        else:
            # 普通工作：简洁摘要
            max_len = 20  # 从 25 减到 20

        # 生成摘要（含类型标签）
        summary = summarize_commit(commit["message"], max_length=max_len, label=label)

        lines.append(f"  - {summary}")

        # 添加子条目细节
        # 重点/难点保留更多细节，普通工作限制细节数量
        details = commit.get("details") or []
        if significance["is_highlight"] or significance["is_challenge"]:
            # 重点/难点：最多保留 3 条细节
            for detail in details[:3]:
                lines.append(f"    - {detail}")
        else:
            # 普通工作：最多保留 1 条细节
            for detail in details[:1]:
                lines.append(f"    - {detail}")

    return "\n".join(lines)


def format_other_section(supplements: List[str]) -> str:
    """格式化"其他"部分

    Args:
        supplements: 补充内容列表

    Returns:
        格式化的 Markdown 内容
    """
    lines = ["其他"]

    for item in supplements:
        lines.append(f"  - {item}")

    return "\n".join(lines)


def summarize_commit(
    message: str,
    max_length: int = 30,
    label: str = "",
) -> str:
    """生成提交摘要（智能截断）

    在自然断点处截断，避免割裂语义：
    - 优先在标点符号处截断
    - 其次在空格处截断
    - 最后才硬截断

    Args:
        message: 提交信息
        max_length: 最大长度（不含标签）
        label: 类型标签（如 [新功能]）

    Returns:
        带标签的摘要文本
    """
    cleaned = clean_commit_message(message)

    # 截断过长的文本（智能截断）
    if len(cleaned) > max_length:
        # 在最大长度范围内寻找自然断点
        truncated = cleaned[:max_length]

        # 1. 优先在中文标点处截断
        for punct in ["。", "，", "、", "；", "：", "！", "？"]:
            idx = truncated.rfind(punct)
            if idx > max_length // 2:  # 至少保留一半内容
                truncated = truncated[:idx + 1]
                break
        else:
            # 2. 尝试在英文标点处截断
            for punct in [".", ",", ";", ":", "!", "?"]:
                idx = truncated.rfind(punct)
                if idx > max_length // 2:
                    truncated = truncated[:idx + 1]
                    break
            else:
                # 3. 尝试在空格处截断
                idx = truncated.rfind(" ")
                if idx > max_length // 2:
                    truncated = truncated[:idx]
                else:
                    # 4. 硬截断并添加省略号
                    truncated = truncated[:max_length - 3] + "..."

        cleaned = truncated

    # 添加类型标签（已禁用以简化输出）
    # if label:
    #     return f"{label} {cleaned.strip()}"

    return cleaned.strip()


def generate_full_report(
    commits_by_project: Dict[str, List[Dict[str, Any]]],
    supplements: Optional[List[str]] = None,
    date_range: Optional[str] = None,
) -> str:
    """生成完整周报

    Args:
        commits_by_project: 按项目分组的提交记录
        supplements: 补充内容列表
        date_range: 日期范围描述

    Returns:
        完整的 Markdown 周报
    """
    # 合并所有提交
    all_commits = []
    for commits in commits_by_project.values():
        all_commits.extend(commits)

    # 生成报告内容
    content = generate_report(all_commits, supplements)

    # 添加标题（如果有日期范围）
    if date_range:
        header = f"# 周报 ({date_range})\n\n"
        content = header + content

    return content
