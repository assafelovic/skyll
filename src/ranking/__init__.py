"""
Ranking strategies for skill search results.

Provides pluggable ranking with relevance scoring for MVP
and placeholders for future semantic search.
"""

from src.ranking.base import Ranker
from src.ranking.relevance import RelevanceRanker, InstallCountRanker
from src.ranking.hybrid import HybridRanker
from src.ranking.semantic import SemanticRanker

__all__ = [
    "Ranker",
    "RelevanceRanker",
    "InstallCountRanker",  # Alias for backward compatibility
    "HybridRanker",
    "SemanticRanker",
]
