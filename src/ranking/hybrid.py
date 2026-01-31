"""
Hybrid ranker combining multiple signals.

Placeholder for future implementation.
"""

from typing import TYPE_CHECKING

from src.ranking.base import Ranker
from src.ranking.relevance import RelevanceRanker

if TYPE_CHECKING:
    from src.core.models import Skill


class HybridRanker(Ranker):
    """
    Placeholder for future hybrid ranking combining multiple signals.
    
    Designed to combine:
    - Install count (popularity)
    - Semantic similarity (embeddings)
    - Recency (last updated)
    - Quality signals (documentation completeness)
    
    Not implemented in MVP - exists to show extension pattern.
    """

    def __init__(
        self,
        popularity_weight: float = 0.3,
        semantic_weight: float = 0.7,
    ):
        self._popularity_weight = popularity_weight
        self._semantic_weight = semantic_weight

    def rank(
        self,
        skills: list["Skill"],
        query: str = "",
        include_references: bool = False,
    ) -> list["Skill"]:
        """
        Hybrid ranking combining popularity and semantic similarity.
        
        MVP: Falls back to InstallCountRanker.
        Future: Will incorporate embedding-based semantic scores.
        """
        return RelevanceRanker().rank(skills, query, include_references)
