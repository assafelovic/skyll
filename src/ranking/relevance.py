"""
Default relevance ranker combining multiple signals.
"""

import math
from typing import TYPE_CHECKING

from src.ranking.base import Ranker

if TYPE_CHECKING:
    from src.core.models import Skill


class RelevanceRanker(Ranker):
    """
    Default ranker combining multiple relevance signals.
    
    Signals (weighted):
    - Content availability: Has actual SKILL.md content (required to rank)
    - References: Has associated reference files
    - Query match: How well skill ID/title/description/content matches query
    - Popularity: Install count from skills.sh
    
    Skills without content are filtered out entirely since they provide
    no value to agents.
    
    Produces normalized 0-100 score for display.
    """

    # Weight constants for score calculation
    CONTENT_WEIGHT = 40.0      # 40 points for having content
    REFERENCES_WEIGHT = 15.0   # 15 points for having references
    QUERY_MATCH_WEIGHT = 30.0  # 30 points max for query match
    POPULARITY_WEIGHT = 15.0   # 15 points max for popularity
    CURATED_BOOST = 15.0       # 15 points boost for curated registry skills
    
    # Registry name for curated skills (from SkillRegistrySource)
    CURATED_REGISTRY = "skyll"

    def _normalize(self, text: str) -> str:
        """Normalize text for matching: lowercase, replace separators with spaces."""
        return text.lower().replace("-", " ").replace("_", " ").replace("/", " ")

    def _compute_query_match(self, skill: "Skill", query: str) -> float:
        """
        Compute how well the skill matches the query (0-1 scale).
        
        Checks multiple fields in priority order:
        1. Skill ID (strongest signal)
        2. Skill title
        3. Skill description (weaker signal, capped lower)
        4. Skill content (weakest signal, capped lowest)
        """
        if not query:
            return 0.0
        
        query_lower = query.lower().strip()
        query_terms = query_lower.split()
        
        # Normalize skill fields
        skill_id = self._normalize(skill.id)
        skill_title = self._normalize(skill.title or "")
        skill_desc = self._normalize(skill.description or "")
        
        # --- ID matching (highest priority) ---
        
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
        
        # --- Title matching ---
        
        # All query terms in title
        if skill_title and all(term in skill_title for term in query_terms):
            return 0.8
        
        # --- Compute scores from multiple signals, take the best ---
        best_score = 0.0
        
        # Partial ID + title matching
        id_title_combined = f"{skill_id} {skill_title}"
        matching_in_id_title = sum(
            1 for term in query_terms if term in id_title_combined
        )
        if matching_in_id_title == len(query_terms):
            best_score = max(best_score, 0.75)
        elif matching_in_id_title > 0:
            id_title_score = 0.5 * (matching_in_id_title / len(query_terms))
            # Description boost when partial ID match exists
            desc_boost = 0.0
            if skill_desc:
                matching_in_desc = sum(
                    1 for term in query_terms if term in skill_desc
                )
                if matching_in_desc > 0:
                    desc_boost = 0.2 * (matching_in_desc / len(query_terms))
            best_score = max(best_score, min(id_title_score + desc_boost, 0.7))
        
        # Description-only matching - if all query terms appear in the
        # description, the skill is genuinely about the topic even if the
        # ID doesn't match (e.g., "gpt-researcher" for "deep research")
        if skill_desc:
            matching_in_desc = sum(
                1 for term in query_terms if term in skill_desc
            )
            if matching_in_desc == len(query_terms):
                best_score = max(best_score, 0.7)
            elif matching_in_desc > 0:
                best_score = max(best_score, 0.35 * (matching_in_desc / len(query_terms)))
        
        # Content matching (weakest signal)
        # Only check first 2000 chars to avoid performance issues
        if skill.content and best_score < 0.15:
            content_preview = self._normalize(skill.content[:2000])
            matching_in_content = sum(
                1 for term in query_terms if term in content_preview
            )
            if matching_in_content > 0:
                best_score = max(best_score, 0.15 * (matching_in_content / len(query_terms)))
        
        return best_score

    def _compute_popularity_score(self, install_count: int) -> float:
        """
        Normalize install count to 0-1 scale.
        
        Uses logarithmic scaling: 10k+ installs = 1.0
        """
        if install_count <= 0:
            return 0.0
        # Log scale: 1 install = ~0.0, 100 = ~0.5, 10000+ = 1.0
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
        
        Skills without content are sorted last (they have less value but
        may still be useful as a pointer to the skill).
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
            
            # Curated registry boost: skills from the local curated registry
            # get a boost since they've been hand-picked for quality
            is_curated = 1.0 if getattr(skill, 'source_registry', None) == self.CURATED_REGISTRY else 0.0
            
            # Compute weighted score (0-100 base, curated can push slightly above)
            score = (
                has_content * self.CONTENT_WEIGHT +
                has_refs * self.REFERENCES_WEIGHT +
                query_match * self.QUERY_MATCH_WEIGHT +
                popularity * self.POPULARITY_WEIGHT +
                is_curated * self.CURATED_BOOST
            )
            
            # Round to 2 decimal places
            skill.relevance_score = round(score, 2)
        
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)


# Alias for backward compatibility
InstallCountRanker = RelevanceRanker
