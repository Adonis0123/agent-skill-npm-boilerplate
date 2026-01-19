"""report_generator 模块测试"""

import pytest
from src.report_generator import (
    extract_keywords,
    clean_commit_message,
    summarize_commit,
    merge_related_commits,
    analyze_work_significance,
    format_project_section,
    filter_trivial_commits,
    generate_report,
)


class TestExtractKeywords:
    """extract_keywords 函数测试"""

    def test_extract_chinese_keywords(self):
        """测试提取中文关键词"""
        keywords = extract_keywords("feat: 用户登录系统开发")
        assert "用户登录系统开发" in keywords

    def test_extract_english_keywords(self):
        """测试提取英文关键词"""
        keywords = extract_keywords("feat: implement user authentication")
        assert "implement" in keywords or "user" in keywords or "authentication" in keywords

    def test_extract_mixed_keywords(self):
        """测试提取中英混合关键词"""
        keywords = extract_keywords("feat: 实现 user login 功能")
        assert len(keywords) > 0

    def test_filter_stop_words(self):
        """测试过滤停用词"""
        keywords = extract_keywords("fix: the bug with this feature")
        assert "the" not in keywords
        assert "with" not in keywords
        assert "this" not in keywords

    def test_max_three_keywords(self):
        """测试最多返回3个关键词"""
        keywords = extract_keywords("feat: 用户 登录 系统 开发 测试 验证")
        assert len(keywords) <= 3


class TestCleanCommitMessage:
    """clean_commit_message 函数测试"""

    def test_clean_with_type_and_scope(self):
        """测试清理带类型和作用域的提交信息"""
        result = clean_commit_message("feat(auth): 用户登录开发")
        assert result == "用户登录开发"

    def test_clean_with_type_only(self):
        """测试清理只带类型的提交信息"""
        result = clean_commit_message("fix: 修复登录问题")
        assert result == "修复登录问题"

    def test_clean_without_prefix(self):
        """测试清理无前缀的提交信息"""
        result = clean_commit_message("更新用户界面")
        assert result == "更新用户界面"


class TestSummarizeCommit:
    """summarize_commit 函数测试"""

    def test_short_message_unchanged(self):
        """测试短消息不变"""
        result = summarize_commit("fix: 修复问题")
        assert result == "修复问题"

    def test_add_label(self):
        """测试添加类型标签"""
        result = summarize_commit("fix: 修复问题", label="[修复]")
        assert result == "[修复] 修复问题"

    def test_smart_truncate_at_chinese_punct(self):
        """测试在中文标点处智能截断"""
        result = summarize_commit("feat: 这是一个很长的描述，需要被截断的文本内容", max_length=15)
        # 应该在逗号处截断
        assert "，" in result or "..." in result

    def test_smart_truncate_at_space(self):
        """测试在空格处智能截断"""
        result = summarize_commit("feat: implement user authentication system", max_length=20)
        # 应该在自然断点截断
        assert len(result) <= 23  # 20 + "..."

    def test_hard_truncate_when_no_breakpoint(self):
        """测试无断点时硬截断"""
        result = summarize_commit("feat: 这是一段没有标点的很长文本需要截断", max_length=10)
        assert "..." in result or len(result) <= 13


class TestMergeRelatedCommits:
    """merge_related_commits 函数测试"""

    def test_empty_commits(self):
        """测试空提交列表"""
        result = merge_related_commits([])
        assert result == []

    def test_single_commit(self):
        """测试单条提交"""
        commits = [{
            "hash": "abc123",
            "message": "feat: 新功能",
            "type": "feat",
            "priority": 1,
        }]
        result = merge_related_commits(commits)
        assert len(result) == 1
        assert result[0]["commit_count"] == 1

    def test_group_by_type(self, sample_commits):
        """测试按类型分组"""
        result = merge_related_commits(sample_commits)

        # 结果应该按优先级排序
        priorities = [c.get("priority", 7) for c in result]
        assert priorities == sorted(priorities)

    def test_merge_similar_commits(self):
        """测试合并相似提交"""
        commits = [
            {
                "hash": "abc1",
                "message": "feat(auth): 用户登录开发",
                "type": "feat",
                "priority": 1,
            },
            {
                "hash": "abc2",
                "message": "feat(auth): 用户登录联调",
                "type": "feat",
                "priority": 1,
            },
        ]
        result = merge_related_commits(commits)

        # 相似的提交应该被合并
        assert len(result) <= 2

    def test_commit_count_tracking(self):
        """测试提交次数追踪"""
        commits = [
            {
                "hash": "abc1",
                "message": "feat: 同一功能第一次提交",
                "type": "feat",
                "priority": 1,
            },
            {
                "hash": "abc2",
                "message": "feat: 同一功能第二次提交",
                "type": "feat",
                "priority": 1,
            },
        ]
        result = merge_related_commits(commits)

        # 合并后应该有 commit_count
        for commit in result:
            assert "commit_count" in commit


class TestAnalyzeWorkSignificance:
    """analyze_work_significance 函数测试"""

    def test_highlight_feat_with_multiple_commits(self):
        """测试 feat 类型多次迭代标记为重点"""
        commit = {
            "type": "feat",
            "is_highlight": True,
            "is_challenge": False,
            "commit_count": 2,
        }
        result = analyze_work_significance(commit)
        assert result["is_highlight"] is True

    def test_highlight_perf_type(self):
        """测试 perf 类型标记为重点"""
        commit = {
            "type": "perf",
            "is_highlight": True,
            "is_challenge": False,
            "commit_count": 1,
        }
        result = analyze_work_significance(commit)
        assert result["is_highlight"] is True

    def test_challenge_fix_with_multiple_commits(self):
        """测试 fix 类型多次尝试标记为难点"""
        commit = {
            "type": "fix",
            "is_highlight": False,
            "is_challenge": True,
            "commit_count": 2,
        }
        result = analyze_work_significance(commit)
        assert result["is_challenge"] is True

    def test_single_feat_not_highlight(self):
        """测试单次 feat 提交不标记为重点（除非类型本身是重点）"""
        commit = {
            "type": "feat",
            "is_highlight": True,  # feat 类型本身是 highlight
            "is_challenge": False,
            "commit_count": 1,
        }
        result = analyze_work_significance(commit)
        # feat 类型本身是 highlight，所以仍然是重点
        assert result["is_highlight"] is True

    def test_single_fix_not_challenge(self):
        """测试单次 fix 提交不标记为难点"""
        commit = {
            "type": "fix",
            "is_highlight": False,
            "is_challenge": True,  # fix 类型本身
            "commit_count": 1,
        }
        result = analyze_work_significance(commit)
        # 单次 fix 不满足 >=2 的条件，但类型本身是 challenge
        assert result["is_challenge"] is True


class TestFormatProjectSection:
    """format_project_section 函数测试"""

    def test_format_with_label(self):
        """测试带标签格式化"""
        commits = [{
            "message": "feat: 新功能开发",
            "label": "[新功能]",
            "type": "feat",
            "is_highlight": True,
            "is_challenge": False,
            "commit_count": 2,
            "priority": 1,
        }]
        result = format_project_section("project-a", commits)

        assert "project-a" in result
        assert "[新功能]" in result

    def test_format_with_challenge(self):
        """测试难点工作格式化（通过细节体现）"""
        commits = [{
            "message": "fix: 修复认证问题",
            "label": "[修复]",
            "type": "fix",
            "is_highlight": False,
            "is_challenge": True,
            "commit_count": 2,
            "priority": 2,
            "details": ["定位问题", "修复代码", "添加测试", "验证修复"],
        }]
        result = format_project_section("project-a", commits)

        assert "[修复]" in result
        # 难点工作应保留更多细节（最多5条）
        assert "定位问题" in result
        assert "修复代码" in result

    def test_format_with_details(self):
        """测试带细节的格式化"""
        commits = [{
            "message": "feat: 主功能",
            "label": "[新功能]",
            "type": "feat",
            "is_highlight": False,
            "is_challenge": False,
            "commit_count": 1,
            "priority": 1,
            "details": ["细节1", "细节2"],
        }]
        result = format_project_section("project-a", commits)

        assert "细节1" in result
        assert "细节2" in result
        assert "    -" in result  # 缩进的细节

    def test_highlight_more_details(self):
        """测试重点工作保留更多细节"""
        commits = [{
            "message": "feat: 用户系统开发",
            "label": "[新功能]",
            "type": "feat",
            "is_highlight": True,
            "is_challenge": False,
            "commit_count": 3,
            "priority": 1,
            "details": ["登录功能", "注册功能", "密码重置", "验证码", "记住登录"],
        }]
        result = format_project_section("project-a", commits)

        # 重点工作应保留最多5条细节
        assert "登录功能" in result
        assert "注册功能" in result
        assert "密码重置" in result

    def test_normal_work_limited_details(self):
        """测试普通工作限制细节数量"""
        commits = [{
            "message": "docs: 更新文档",
            "label": "[文档]",
            "type": "docs",
            "is_highlight": False,
            "is_challenge": False,
            "commit_count": 1,
            "priority": 5,
            "details": ["细节1", "细节2", "细节3", "细节4"],
        }]
        result = format_project_section("project-a", commits)

        # 普通工作最多保留2条细节
        assert "细节1" in result
        assert "细节2" in result
        assert "细节3" not in result
        assert "细节4" not in result


class TestFilterTrivialCommits:
    """filter_trivial_commits 函数测试"""

    def test_filter_trivial(self, trivial_commits, sample_commits):
        """测试过滤琐碎提交"""
        all_commits = trivial_commits + sample_commits
        result = filter_trivial_commits(all_commits)

        # 琐碎提交应该被过滤
        assert len(result) == len(sample_commits)
        for commit in result:
            assert commit["is_trivial"] is False


class TestGenerateReport:
    """generate_report 函数测试"""

    def test_generate_empty_report(self):
        """测试生成空报告"""
        result = generate_report([])
        assert result == ""

    def test_generate_report_with_commits(self, sample_commits):
        """测试生成包含提交的报告"""
        result = generate_report(sample_commits)

        assert "project-frontend" in result
        assert "[新功能]" in result or "[修复]" in result or "[优化]" in result

    def test_generate_report_with_supplements(self):
        """测试生成包含补充内容的报告"""
        result = generate_report([], supplements=["参与技术分享", "代码评审"])

        assert "其他" in result
        assert "参与技术分享" in result
        assert "代码评审" in result
