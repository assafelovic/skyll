"""
Skill sources for discovering agent skills from various registries.

Each source implements the SkillSource protocol to provide a consistent
interface for searching and fetching skills.
"""

from src.sources.base import SkillSource, SkillSearchResult
from src.sources.skillssh import SkillsShSource
from src.sources.registry import SkillRegistrySource

__all__ = [
    "SkillSource",
    "SkillSearchResult",
    "SkillsShSource",
    "SkillRegistrySource",
]
