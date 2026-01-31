"""
External API clients for content fetching.

- GitHubClient: Fetch raw SKILL.md content from repositories

Note: Skill discovery is now handled by src.sources module which supports
multiple sources (skills.sh, awesome lists, etc.)
"""

from src.clients.github import GitHubClient

__all__ = ["GitHubClient"]
