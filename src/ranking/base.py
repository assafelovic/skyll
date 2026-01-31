"""
Base ranker interface for skill search results.
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
    def rank(
        self,
        skills: list["Skill"],
        query: str = "",
        include_references: bool = False,
    ) -> list["Skill"]:
        """
        Rank skills by relevance.
        
        Args:
            skills: List of skills to rank
            query: Original search query for relevance scoring
            include_references: Whether references were requested (boosts skills with refs)
            
        Returns:
            Skills sorted by relevance_score (descending)
        """
        pass
