"""测试共享 fixtures"""

import pytest
import sys
from pathlib import Path

# 添加 src 目录到 Python 路径
src_path = Path(__file__).parent.parent
sys.path.insert(0, str(src_path))


@pytest.fixture
def sample_commits():
    """示例提交记录"""
    return [
        {
            "hash": "abc123",
            "message": "feat(auth): 用户登录系统开发",
            "author": "test",
            "date": "2026-01-10",
            "type": "feat",
            "is_trivial": False,
            "is_highlight": True,
            "is_challenge": False,
            "label": "[新功能]",
            "priority": 1,
            "project": "project-frontend",
        },
        {
            "hash": "abc124",
            "message": "feat(auth): 接口对接和联调",
            "author": "test",
            "date": "2026-01-11",
            "type": "feat",
            "is_trivial": False,
            "is_highlight": True,
            "is_challenge": False,
            "label": "[新功能]",
            "priority": 1,
            "project": "project-frontend",
        },
        {
            "hash": "def456",
            "message": "fix(auth): 认证流程问题修复",
            "author": "test",
            "date": "2026-01-09",
            "type": "fix",
            "is_trivial": False,
            "is_highlight": False,
            "is_challenge": True,
            "label": "[修复]",
            "priority": 2,
            "project": "project-frontend",
        },
        {
            "hash": "def457",
            "message": "fix(auth): 继续修复认证问题",
            "author": "test",
            "date": "2026-01-10",
            "type": "fix",
            "is_trivial": False,
            "is_highlight": False,
            "is_challenge": True,
            "label": "[修复]",
            "priority": 2,
            "project": "project-frontend",
        },
        {
            "hash": "ghi789",
            "message": "refactor: 构建工具升级改造",
            "author": "test",
            "date": "2026-01-08",
            "type": "refactor",
            "is_trivial": False,
            "is_highlight": False,
            "is_challenge": False,
            "label": "[优化]",
            "priority": 3,
            "project": "project-frontend",
        },
        {
            "hash": "jkl012",
            "message": "docs: 更新 README 文档",
            "author": "test",
            "date": "2026-01-07",
            "type": "docs",
            "is_trivial": False,
            "is_highlight": False,
            "is_challenge": False,
            "label": "[文档]",
            "priority": 5,
            "project": "project-frontend",
        },
    ]


@pytest.fixture
def trivial_commits():
    """琐碎提交记录"""
    return [
        {
            "hash": "tri001",
            "message": "fix typo in comment",
            "author": "test",
            "date": "2026-01-10",
            "type": "other",
            "is_trivial": True,
            "is_highlight": False,
            "is_challenge": False,
            "label": "",
            "priority": 7,
            "project": "project-frontend",
        },
        {
            "hash": "tri002",
            "message": "Merge branch 'feature' into main",
            "author": "test",
            "date": "2026-01-10",
            "type": "other",
            "is_trivial": True,
            "is_highlight": False,
            "is_challenge": False,
            "label": "",
            "priority": 7,
            "project": "project-frontend",
        },
    ]


@pytest.fixture
def single_commit():
    """单条提交"""
    return {
        "hash": "single001",
        "message": "feat: 实现用户头像上传功能",
        "author": "test",
        "date": "2026-01-10",
        "type": "feat",
        "is_trivial": False,
        "is_highlight": True,
        "is_challenge": False,
        "label": "[新功能]",
        "priority": 1,
        "project": "project-backend",
    }
