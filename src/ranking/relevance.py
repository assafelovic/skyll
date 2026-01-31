"""
Default relevance ranker combining multiple signals.
"""

from typing import TYPE_CHECKING

from src.ranking.base import Ranker

if TYPE_CHECKING:
    from src.core.models import Skill


class RelevanceRanker(Ranker):
    """
    Default ranker combining multiple relevance signals.
    
    Signals (weighted):
    - Content availability: Has actual SKILL.md content
    - References: Has associated reference files
    - Query match: How well skill ID matches search query
    - Popularity: Install count from skills.sh
    
    Produces both:
    - relevance_score: Raw internal score for sorting
    - Normalized 0-100 score for display
    """

    # Weight constants for score calculation
    CONTENT_WEIGHT = 40.0      # 40 points for having content
    REFERENCES_WEIGHT = 15.0   # 15 points for having references
    QUERY_MATCH_WEIGHT = 30.0  # 30 points max for query match
    POPULARITY_WEIGHT = 15.0   # 15 points max for popularity

    def _compute_query_match(self, skill: "Skill", query: str) -> float:
        """
        Compute how well the skill matches the query (0-1 scale).
        
        Matching priority:
        1.0 - Exact ID match
        0.9 - All query terms in ID
        0.85 - All ID terms in query
        0.0-0.5 - Partial term matches
        """
        if not query:
            return 0.0
        
        query_lower = query.lower().strip()
        query_terms = query_lower.split()
        
        # Normalize skill ID: "gpt-researcher" -> "gpt researcher"
        skill_id = skill.id.lower().replace("-", " ").replace("_", " ")
        skill_title = (skill.title or "").lower().replace("-", " ").replace("_", " ")
        
        # Exact match on ID
        if query_lower == skill_id or query_lower == skill.id.lower():
            return 1.0
        
        # Query terms fully contained in ID
        if all(term in skill_id for term in query_terms):
            return 0.9
        
        # ID contained in query (e.g., "gpt-researcher" in "gpt researcher deep research")
        id_terms = skill_id.split()
        if all(term in query_lower for term in id_terms):
            return 0.85
        
        # Partial term matches
        matching_terms = sum(1 for term in query_terms if term in skill_id or term in skill_title)
        if matching_terms > 0:
            return 0.5 * (matching_terms / len(query_terms))
        
        return 0.0

    def _compute_popularity_score(self, install_count: int) -> float:
        """
        Normalize install count to 0-1 scale.
        
        Uses logarithmic scaling: 10k+ installs = 1.0
        """
        if install_count <= 0:
            return 0.0
        # Log scale: 1 install = ~0.0, 100 = ~0.5, 10000+ = 1.0
        import math
        normalized = math.log10(install_count + 1) / 4.0  # log10(10000) = 4
        return min(normalized, 1.0)

    def rank(
        self,
        skills: list["Skill"],
        query: str = "",
        include_references: bool = False,
    ) -> list["Skill"]:
        """
        Rank skills by combined relevance signals.
        
        Sets relevance_score as normalized 0-100 value for display.
        """
        for skill in skills:
            # Content signal (0 or 1)
            has_content = 1.0 if skill.content else 0.0
            
            # References signal (0 or 1, only when requested)
            has_refs = 0.0
            if include_references and skill.references:
                has_refs = 1.0
            
            # Query match signal (0-1)
            query_match = self._compute_query_match(skill, query)
            
            # Popularity signal (0-1, log scaled)
            popularity = self._compute_popularity_score(skill.install_count)
            
            # Compute weighted score (0-100)
            score = (
                has_content * self.CONTENT_WEIGHT +
                has_refs * self.REFERENCES_WEIGHT +
                query_match * self.QUERY_MATCH_WEIGHT +
                popularity * self.POPULARITY_WEIGHT
            )
            
            # Round to 2 decimal places
            skill.relevance_score = round(score, 2)
        
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)


# Alias for backward compatibility
InstallCountRanker = RelevanceRanker
