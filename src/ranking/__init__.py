"""
Ranking strategies for skill search results.

Provides pluggable ranking with install count for MVP
and placeholder for future semantic search.
"""

from src.ranking.rankers import Ranker, InstallCountRanker

__all__ = ["Ranker", "InstallCountRanker"]
