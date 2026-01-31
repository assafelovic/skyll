"""
Skill Garden Registry source.

Reads skills from the local SKILLS_REGISTRY.md file - a community-curated
list of agent skills that's easy to parse and contribute to.
"""

import logging
import re
from dataclasses import dataclass
from pathlib import Path

from src.sources.base import SkillSearchResult

logger = logging.getLogger(__name__)

# Path to the registry file (relative to project root)
REGISTRY_FILE = Path(__file__).parent.parent.parent / "registry" / "SKILLS.md"


@dataclass
class RegistrySkill:
    """A skill entry from the registry."""
    id: str
    owner: str
    repo: str
    path: str | None
    description: str
    category: str


class SkillRegistrySource:
    """
    Skill source backed by the local SKILLS_REGISTRY.md file.
    
    This is a community-curated list that's easy to parse and contribute to.
    Skills are added via PRs to the repository.
    
    Format in the file:
        - skill-id | owner/repo | path/to/skill | Description
    """
    
    REGISTRY_NAME = "skill-garden"
    
    def __init__(self, enabled: bool = True):
        self._enabled = enabled
        self._skills_cache: list[RegistrySkill] = []
        self._loaded = False
    
    @property
    def name(self) -> str:
        return self.REGISTRY_NAME
    
    @property
    def enabled(self) -> bool:
        return self._enabled
    
    async def __aenter__(self) -> "SkillRegistrySource":
        """Load the registry on startup."""
        self._load_registry()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Nothing to clean up."""
        pass
    
    def _load_registry(self) -> None:
        """Load and parse the SKILLS_REGISTRY.md file."""
        if not REGISTRY_FILE.exists():
            logger.warning(f"Registry file not found: {REGISTRY_FILE}")
            self._skills_cache = []
            self._loaded = True
            return
        
        try:
            content = REGISTRY_FILE.read_text(encoding="utf-8")
            self._skills_cache = self._parse_registry(content)
            self._loaded = True
            logger.info(f"Loaded {len(self._skills_cache)} skills from registry")
        except Exception as e:
            logger.error(f"Failed to load registry: {e}")
            self._skills_cache = []
            self._loaded = True
    
    def _parse_registry(self, content: str) -> list[RegistrySkill]:
        """
        Parse the SKILLS.md content.
        
        Format: - skill-id | owner/repo | path/to/skill | Description
        """
        skills = []
        current_category = "General"
        
        # Remove code blocks to avoid parsing examples
        content_no_code = re.sub(r'```[\s\S]*?```', '', content)
        # Remove HTML comments
        content_no_code = re.sub(r'<!--[\s\S]*?-->', '', content_no_code)
        
        # Pattern for category headers
        category_pattern = re.compile(r'^##\s+[^\w]*(.+)$', re.MULTILINE)
        
        # Pattern for skill entries: - id | owner/repo | path | description
        skill_pattern = re.compile(
            r'^-\s+([^|]+)\s*\|\s*([^/]+)/([^|]+)\s*\|\s*([^|]*)\s*\|\s*(.+)$',
            re.MULTILINE
        )
        
        # Find categories and their positions
        categories = [(m.start(), m.group(1).strip()) for m in category_pattern.finditer(content_no_code)]
        
        for match in skill_pattern.finditer(content_no_code):
            pos = match.start()
            
            # Find which category this skill belongs to
            for cat_pos, cat_name in reversed(categories):
                if pos > cat_pos:
                    current_category = cat_name
                    break
            
            skill_id = match.group(1).strip()
            owner = match.group(2).strip()
            repo = match.group(3).strip()
            path = match.group(4).strip() or None
            description = match.group(5).strip()
            
            skills.append(RegistrySkill(
                id=skill_id,
                owner=owner,
                repo=repo,
                path=path,
                description=description,
                category=current_category,
            ))
        
        return skills
    
    def _match_query(self, skill: RegistrySkill, query: str) -> float:
        """
        Score how well a skill matches the query.
        
        Returns a score from 0 to 1, higher is better match.
        """
        query_lower = query.lower()
        query_terms = query_lower.split()
        
        # Check ID match
        id_lower = skill.id.lower()
        if query_lower == id_lower:
            return 1.0
        if query_lower in id_lower:
            return 0.9
        
        # Check description match
        desc_lower = skill.description.lower()
        if query_lower in desc_lower:
            return 0.7
        
        # Check category match
        cat_lower = skill.category.lower()
        if query_lower in cat_lower:
            return 0.5
        
        # Check individual terms
        searchable = f"{id_lower} {desc_lower} {cat_lower}"
        matches = sum(1 for term in query_terms if term in searchable)
        if matches > 0:
            return 0.3 * (matches / len(query_terms))
        
        return 0.0
    
    async def search(self, query: str, limit: int = 10) -> list[SkillSearchResult]:
        """Search the registry for matching skills."""
        if not self._enabled:
            return []
        
        if not self._loaded:
            self._load_registry()
        
        if not self._skills_cache:
            return []
        
        # Score and rank skills
        scored_skills = []
        for skill in self._skills_cache:
            score = self._match_query(skill, query)
            if score > 0:
                scored_skills.append((score, skill))
        
        # Sort by score descending
        scored_skills.sort(key=lambda x: x[0], reverse=True)
        
        # Convert to results
        results = []
        for score, skill in scored_skills[:limit]:
            # Determine the skill path for fetching
            source = f"{skill.owner}/{skill.repo}"
            skill_id = skill.path.rstrip('/').split('/')[-1] if skill.path else skill.id
            
            results.append(
                SkillSearchResult(
                    id=skill_id,
                    name=skill.id,  # Use the registry ID as display name
                    source=source,
                    source_registry=self.REGISTRY_NAME,
                    installs=0,  # No popularity data
                    description=skill.description,
                )
            )
        
        logger.debug(f"registry: '{query}' returned {len(results)} results")
        return results
    
    async def refresh(self) -> None:
        """Reload the registry file."""
        self._loaded = False
        self._load_registry()
