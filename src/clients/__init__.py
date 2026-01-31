"""
External API clients for skill discovery and content fetching.

- SkillsShClient: Search skills.sh directory
- GitHubClient: Fetch raw SKILL.md content from repositories
"""

from src.clients.github import GitHubClient
from src.clients.skillssh import SkillsShClient

__all__ = ["SkillsShClient", "GitHubClient"]
