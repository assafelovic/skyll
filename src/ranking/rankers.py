"""
Ranking strategies for skill search results.

Currently implements install count ranking (popularity).
Designed for easy extension to semantic/embedding-based ranking.
"""

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.core.models import Skill


class Ranker(ABC):
    """
    Abstract base class for ranking strategies.
    
    Rankers take a list of skills and return them sorted by relevance.
    Each ranker sets the relevance_score field on skills.
    """

    @abstractmethod
    def rank(self, skills: list["Skill"]) -> list["Skill"]:
        """
        Rank skills by relevance.
        
        Args:
            skills: List of skills to rank
            
        Returns:
            Skills sorted by relevance_score (descending)
        """
        pass


class InstallCountRanker(Ranker):
    """
    Ranks skills by install count (popularity-based).
    
    Simple and effective ranking using skills.sh telemetry data.
    Higher install counts indicate more trusted/useful skills.
    
    Sets relevance_score = install_count for each skill.
    
    Example:
        ranker = InstallCountRanker()
        ranked = ranker.rank(skills)
        # Skills now sorted by install_count descending
    """

    def rank(self, skills: list["Skill"]) -> list["Skill"]:
        """Sort skills by install count descending."""
        for skill in skills:
            skill.relevance_score = float(skill.install_count)
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)


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
        # Future: self._embedding_model = ...

    def rank(self, skills: list["Skill"]) -> list["Skill"]:
        """
        Hybrid ranking combining popularity and semantic similarity.
        
        MVP: Falls back to install count only.
        Future: Will incorporate embedding-based semantic scores.
        """
        # MVP implementation - just use install count
        # TODO: Add semantic similarity when embedding model is integrated
        for skill in skills:
            popularity_score = float(skill.install_count) / 100000  # Normalize
            semantic_score = 0.5  # Placeholder - would come from embeddings

            skill.relevance_score = (
                self._popularity_weight * popularity_score
                + self._semantic_weight * semantic_score
            )

        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)


# Future semantic ranker placeholder
class SemanticRanker(Ranker):
    """
    Placeholder for embedding-based semantic ranking.
    
    Will use sentence transformers or similar to compute
    query-skill similarity based on description and content.
    
    Not implemented in MVP.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self._model_name = model_name
        # Future: self._model = SentenceTransformer(model_name)

    def rank(self, skills: list["Skill"]) -> list["Skill"]:
        """
        Rank by semantic similarity to query.
        
        NOT IMPLEMENTED - falls back to install count.
        """
        # Placeholder - would compute embeddings and cosine similarity
        return InstallCountRanker().rank(skills)
