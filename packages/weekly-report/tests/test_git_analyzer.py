"""git_analyzer 模块测试"""

import pytest
from src.git_analyzer import (
    parse_commit_message,
    COMMIT_TYPE_CONFIG,
    TRIVIAL_PATTERNS,
)


class TestParseCommitMessage:
    """parse_commit_message 函数测试"""

    def test_parse_feat_commit(self):
        """测试解析 feat 类型提交"""
        result = parse_commit_message("feat(auth): 用户登录系统开发")

        assert result["type"] == "feat"
        assert result["scope"] == "auth"
        assert result["description"] == "用户登录系统开发"
        assert result["is_trivial"] is False
        assert result["is_highlight"] is True
        assert result["is_challenge"] is False
        assert result["priority"] == 1

    def test_parse_fix_commit(self):
        """测试解析 fix 类型提交"""
        result = parse_commit_message("fix(auth): 修复登录问题")

        assert result["type"] == "fix"
        assert result["scope"] == "auth"
        assert result["description"] == "修复登录问题"
        assert result["is_trivial"] is False
        assert result["is_highlight"] is False
        assert result["is_challenge"] is True
        assert result["priority"] == 2

    def test_parse_refactor_commit(self):
        """测试解析 refactor 类型提交"""
        result = parse_commit_message("refactor: 重构用户模块")

        assert result["type"] == "refactor"
        assert result["scope"] is None
        assert result["description"] == "重构用户模块"
        assert result["priority"] == 3

    def test_parse_perf_commit(self):
        """测试解析 perf 类型提交（应标记为重点）"""
        result = parse_commit_message("perf: 优化页面加载速度")

        assert result["type"] == "perf"
        assert result["is_highlight"] is True
        assert result["priority"] == 3

    def test_parse_docs_commit(self):
        """测试解析 docs 类型提交"""
        result = parse_commit_message("docs: 更新 API 文档")

        assert result["type"] == "docs"
        assert result["priority"] == 5

    def test_parse_commit_without_type(self):
        """测试解析无类型前缀的提交"""
        result = parse_commit_message("更新用户界面")

        assert result["type"] == "other"
        assert result["scope"] is None
        assert result["description"] == "更新用户界面"
        assert result["priority"] == 7

    def test_parse_trivial_typo_commit(self):
        """测试识别 typo 琐碎提交"""
        result = parse_commit_message("fix typo in README")

        assert result["is_trivial"] is True

    def test_parse_trivial_merge_commit(self):
        """测试识别 merge 琐碎提交"""
        result = parse_commit_message("Merge branch 'feature' into main")

        assert result["is_trivial"] is True

    def test_parse_trivial_wip_commit(self):
        """测试识别 WIP 琐碎提交"""
        result = parse_commit_message("wip: 开发中")

        assert result["is_trivial"] is True

    def test_parse_trivial_format_commit(self):
        """测试识别 format 琐碎提交"""
        result = parse_commit_message("format code")

        assert result["is_trivial"] is True


class TestCommitTypeConfig:
    """COMMIT_TYPE_CONFIG 配置测试（无标签风格）"""

    def test_feat_config(self):
        """测试 feat 类型配置"""
        config = COMMIT_TYPE_CONFIG["feat"]
        assert config["priority"] == 1
        assert config["is_highlight"] is True
        assert config["is_challenge"] is False

    def test_fix_config(self):
        """测试 fix 类型配置"""
        config = COMMIT_TYPE_CONFIG["fix"]
        assert config["priority"] == 2
        assert config["is_highlight"] is False
        assert config["is_challenge"] is True

    def test_all_types_have_required_fields(self):
        """测试所有类型都有必需字段"""
        required_fields = ["priority", "is_highlight", "is_challenge"]

        for type_name, config in COMMIT_TYPE_CONFIG.items():
            for field in required_fields:
                assert field in config, f"{type_name} 缺少 {field} 字段"

    def test_priorities_are_valid(self):
        """测试优先级值有效"""
        for type_name, config in COMMIT_TYPE_CONFIG.items():
            assert 1 <= config["priority"] <= 10, f"{type_name} 优先级无效"
