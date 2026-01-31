"""
Semantic ranker using embeddings.

Placeholder for future implementation.
"""

from typing import TYPE_CHECKING

from src.ranking.base import Ranker
from src.ranking.relevance import RelevanceRanker

if TYPE_CHECKING:
    from src.core.models import Skill


class SemanticRanker(Ranker):
    """
    Placeholder for embedding-based semantic ranking.
    
    Will use sentence transformers or similar to compute
    query-skill similarity based on description and content.
    
    Not implemented in MVP.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self._model_name = model_name

    def rank(
        self,
        skills: list["Skill"],
        query: str = "",
        include_references: bool = False,
    ) -> list["Skill"]:
        """
        Rank by semantic similarity to query.
        
        NOT IMPLEMENTED - falls back to InstallCountRanker.
        """
        return RelevanceRanker().rank(skills, query, include_references)
