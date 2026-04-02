"""
Default relevance ranker combining multiple signals.
"""

import math
import re
from typing import TYPE_CHECKING

from src.ranking.base import Ranker

if TYPE_CHECKING:
    from src.core.models import Skill


class RelevanceRanker(Ranker):
    """
    Default ranker combining multiple relevance signals.
    
    Signals (weighted, total 100 points):
    - Content quality (30 pts): Graded by length + structure, not binary
    - Content structure (5 pts): Has code blocks, headers, tables
    - References depth (10 pts): Graded by count (more refs = higher)
    - Metadata completeness (5 pts): Has description, version, allowed_tools
    - Query match (30 pts): How well skill ID/title/description/content matches query
    - Popularity (20 pts): Install count from skills.sh (log scaled, ceiling 50k)
    
    Additionally, skills from the curated local registry receive a small
    boost scaled by query relevance (up to 5 pts for strong matches).
    
    Produces normalized 0-100 score for display. Reaching 100 requires
    exceptional content depth, multiple references, complete metadata,
    high popularity, AND strong query relevance.
    """

    CONTENT_QUALITY_WEIGHT = 30.0
    CONTENT_STRUCTURE_WEIGHT = 5.0
    REFERENCES_WEIGHT = 10.0
    METADATA_WEIGHT = 5.0
    QUERY_MATCH_WEIGHT = 30.0
    POPULARITY_WEIGHT = 20.0
    
    CURATED_BOOST = 5.0
    CURATED_REGISTRY = "skyll"

    def _normalize(self, text: str) -> str:
        """Normalize text for matching: lowercase, replace separators with spaces."""
        return text.lower().replace("-", " ").replace("_", " ").replace("/", " ")

    def _to_words(self, text: str) -> set[str]:
        """Extract unique words from normalized text for whole-word matching."""
        return set(self._normalize(text).split())

    def _word_match_count(self, terms: list[str], word_set: set[str]) -> int:
        """Count how many terms appear as whole words in the word set."""
        return sum(1 for term in terms if term in word_set)

    def _all_terms_in(self, terms: list[str], word_set: set[str]) -> bool:
        """Check if all terms appear as whole words in the word set."""
        return all(term in word_set for term in terms)

    def _compute_query_match(self, skill: "Skill", query: str) -> float:
        """
        Compute how well the skill matches the query (0-1 scale).
        
        Uses whole-word matching (not substring) to avoid false positives
        like "search" matching "research".
        
        Checks multiple fields in priority order:
        1. Skill ID (strongest signal)
        2. Skill title
        3. Skill description (weaker signal, capped lower)
        4. Skill content (weakest signal, capped lowest)
        """
        if not query:
            return 0.0
        
        query_terms = query.lower().strip().split()
        query_words = set(query_terms)
        
        # Build word sets for each field (whole-word matching)
        id_words = self._to_words(skill.id)
        title_words = self._to_words(skill.title or "")
        desc_words = self._to_words(skill.description or "")
        
        # --- ID matching (highest priority) ---
        
        # Exact match on ID (normalized)
        skill_id_normalized = self._normalize(skill.id)
        query_normalized = query.lower().strip()
        if query_normalized == skill_id_normalized or query_normalized == skill.id.lower():
            return 1.0
        
        # Query terms fully contained in ID words
        if self._all_terms_in(query_terms, id_words):
            return 0.9
        
        # ID words fully contained in query (e.g., "gpt-researcher" in "gpt researcher deep research")
        if self._all_terms_in(list(id_words), query_words):
            return 0.85
        
        # --- Title matching ---
        
        # All query terms in title words
        if title_words and self._all_terms_in(query_terms, title_words):
            return 0.8
        
        # --- Compute scores from multiple signals, take the best ---
        best_score = 0.0
        
        # Partial ID + title matching
        id_title_words = id_words | title_words
        matching_in_id_title = self._word_match_count(query_terms, id_title_words)
        if matching_in_id_title == len(query_terms):
            best_score = max(best_score, 0.75)
        elif matching_in_id_title > 0:
            id_title_score = 0.5 * (matching_in_id_title / len(query_terms))
            # Description boost when partial ID match exists
            desc_boost = 0.0
            if desc_words:
                matching_in_desc = self._word_match_count(query_terms, desc_words)
                if matching_in_desc > 0:
                    desc_boost = 0.2 * (matching_in_desc / len(query_terms))
            best_score = max(best_score, min(id_title_score + desc_boost, 0.7))
        
        # Description-only matching - if all query terms appear in the
        # description, the skill is genuinely about the topic even if the
        # ID doesn't match (e.g., "gpt-researcher" for "deep research")
        if desc_words:
            matching_in_desc = self._word_match_count(query_terms, desc_words)
            if matching_in_desc == len(query_terms):
                best_score = max(best_score, 0.7)
            elif matching_in_desc > 0:
                best_score = max(best_score, 0.35 * (matching_in_desc / len(query_terms)))
        
        # Content matching (weakest signal)
        # Only check first 2000 chars to avoid performance issues
        if skill.content and best_score < 0.15:
            content_words = self._to_words(skill.content[:2000])
            matching_in_content = self._word_match_count(query_terms, content_words)
            if matching_in_content > 0:
                best_score = max(best_score, 0.15 * (matching_in_content / len(query_terms)))
        
        return best_score

    def _compute_content_quality(self, content: str | None) -> float:
        """
        Grade content quality on 0-1 scale based on length.
        
        Short stubs get partial credit; comprehensive content gets full marks.
        Thresholds: <100 chars = 0, 500 = ~0.5, 2000+ = 1.0
        """
        if not content:
            return 0.0
        length = len(content)
        if length < 100:
            return 0.1
        if length >= 2000:
            return 1.0
        # Smooth curve between 100 and 2000
        return 0.1 + 0.9 * ((length - 100) / 1900)

    def _compute_content_structure(self, content: str | None) -> float:
        """
        Grade content structure on 0-1 scale.
        
        Checks for: markdown headers, code blocks, tables, lists.
        Each structural element contributes 0.25, max 1.0.
        """
        if not content:
            return 0.0
        score = 0.0
        if re.search(r'^#{1,3}\s+\S', content, re.MULTILINE):
            score += 0.25
        if '```' in content:
            score += 0.25
        if re.search(r'^\|.*\|.*\|', content, re.MULTILINE):
            score += 0.25
        if re.search(r'^[-*]\s+\S', content, re.MULTILINE):
            score += 0.25
        return score

    def _compute_references_score(self, skill: "Skill", include_references: bool) -> float:
        """
        Grade references on 0-1 scale by count (not binary).
        
        1 ref = 0.3, 2-3 refs = 0.6, 4-5 refs = 0.8, 6+ refs = 1.0
        """
        if not include_references or not skill.references:
            return 0.0
        count = len(skill.references)
        if count >= 6:
            return 1.0
        if count >= 4:
            return 0.8
        if count >= 2:
            return 0.6
        return 0.3

    def _compute_metadata_score(self, skill: "Skill") -> float:
        """
        Grade metadata completeness on 0-1 scale.
        
        Checks: description, version, allowed_tools. Each worth 1/3.
        """
        score = 0.0
        if skill.description and len(skill.description) > 20:
            score += 0.34
        if skill.version:
            score += 0.33
        if skill.allowed_tools:
            score += 0.33
        return score

    def _compute_popularity_score(self, install_count: int) -> float:
        """
        Normalize install count to 0-1 scale.
        
        Uses logarithmic scaling with higher ceiling: 50k+ installs = 1.0
        """
        if install_count <= 0:
            return 0.0
        # Log scale: 1 = ~0.0, 100 = ~0.43, 1000 = ~0.64, 10000 = ~0.85, 50000 = 1.0
        normalized = math.log10(install_count + 1) / math.log10(50001)
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
            content_quality = self._compute_content_quality(skill.content)
            content_structure = self._compute_content_structure(skill.content)
            refs_score = self._compute_references_score(skill, include_references)
            metadata_score = self._compute_metadata_score(skill)
            query_match = self._compute_query_match(skill, query)
            popularity = self._compute_popularity_score(skill.install_count)
            
            is_curated = 1.0 if getattr(skill, 'source_registry', None) == self.CURATED_REGISTRY else 0.0
            curated_score = is_curated * self.CURATED_BOOST * query_match
            
            score = (
                content_quality * self.CONTENT_QUALITY_WEIGHT +
                content_structure * self.CONTENT_STRUCTURE_WEIGHT +
                refs_score * self.REFERENCES_WEIGHT +
                metadata_score * self.METADATA_WEIGHT +
                query_match * self.QUERY_MATCH_WEIGHT +
                popularity * self.POPULARITY_WEIGHT +
                curated_score
            )
            
            skill.relevance_score = round(min(score, 100.0), 2)
        
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)


# Alias for backward compatibility
InstallCountRanker = RelevanceRanker
