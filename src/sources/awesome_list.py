"""
Awesome Claude Skills list source.

Parses the curated awesome-claude-skills repository to discover skills
from the community-maintained list.

Repository: https://github.com/ComposioHQ/awesome-claude-skills
"""

import logging
import re
from dataclasses import dataclass
from datetime import datetime, timedelta

import httpx

from src.sources.base import SkillSource, SkillSearchResult

logger = logging.getLogger(__name__)


@dataclass
class ParsedSkillLink:
    """A skill link parsed from the awesome list README."""
    name: str
    description: str
    owner: str
    repo: str
    skill_folder: str | None = None  # If directly to a skill folder


class AwesomeListSource:
    """
    Skill source backed by the awesome-claude-skills GitHub repository.
    
    This source parses the README.md from the ComposioHQ/awesome-claude-skills
    repository to extract skill links. Results are cached and refreshed periodically.
    
    Note: This is a curated community list, so skills may overlap with skills.sh.
    Deduplication should be handled at the service layer.
    """
    
    REGISTRY_NAME = "awesome-list"
    REPO_OWNER = "ComposioHQ"
    REPO_NAME = "awesome-claude-skills"
    README_URL = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/master/README.md"
    
    # Cache refresh interval (1 hour)
    CACHE_TTL = timedelta(hours=1)
    
    def __init__(
        self,
        timeout: float = 15.0,
        enabled: bool = True,
    ):
        self._timeout = timeout
        self._enabled = enabled
        self._client: httpx.AsyncClient | None = None
        
        # Cached skill list
        self._skills_cache: list[ParsedSkillLink] = []
        self._cache_updated: datetime | None = None
    
    @property
    def name(self) -> str:
        return self.REGISTRY_NAME
    
    @property
    def enabled(self) -> bool:
        return self._enabled
    
    async def __aenter__(self) -> "AwesomeListSource":
        self._client = httpx.AsyncClient(
            timeout=self._timeout,
            headers={"User-Agent": "skill-garden/0.1.0"},
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None
    
    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("AwesomeListSource must be used as async context manager")
        return self._client
    
    def _is_cache_valid(self) -> bool:
        """Check if the cache is still valid."""
        if not self._cache_updated or not self._skills_cache:
            return False
        return datetime.now() - self._cache_updated < self.CACHE_TTL
    
    async def _fetch_readme(self) -> str | None:
        """Fetch the README.md from GitHub."""
        try:
            response = await self.client.get(self.README_URL)
            if response.status_code == 200:
                return response.text
            logger.warning(f"Failed to fetch awesome list README: {response.status_code}")
            return None
        except Exception as e:
            logger.error(f"Error fetching awesome list: {e}")
            return None
    
    def _parse_skill_links(self, readme_content: str) -> list[ParsedSkillLink]:
        """
        Parse skill links from the README markdown.
        
        Looks for patterns like:
        - [skill-name](https://github.com/owner/repo/tree/branch/skill-folder) - Description
        - [skill-name](https://github.com/owner/repo) - Description
        """
        skills = []
        
        # Pattern for GitHub links in markdown: - [name](url) - description
        # Matches both full GitHub URLs and relative paths
        # Format: - [Name](https://github.com/owner/repo...) - Description
        link_pattern = re.compile(
            r'^-\s+\[([^\]]+)\]\((https://github\.com/([^/]+)/([^/\)]+)(?:/tree/[^/]+/([^\)]+))?)\)\s*[-–—]\s*(.+)',
            re.MULTILINE
        )
        
        for match in link_pattern.finditer(readme_content):
            name = match.group(1).strip()
            url = match.group(2).strip()
            owner = match.group(3).strip()
            repo = match.group(4).strip()
            skill_folder = match.group(5).strip() if match.group(5) else None
            description = match.group(6).strip()
            
            # Clean up description - remove trailing author info
            if '*By' in description:
                description = description.split('*By')[0].strip().rstrip('.')
            
            # Skip non-skill links (like documentation, official repos, etc.)
            skip_keywords = ['documentation', 'official', 'anthropic.com', 'blog', 'guide']
            if any(kw in description.lower() for kw in skip_keywords):
                continue
            
            # Skip if it's the awesome-claude-skills repo itself
            if repo == self.REPO_NAME:
                continue
            
            skills.append(ParsedSkillLink(
                name=name,
                description=description,
                owner=owner,
                repo=repo,
                skill_folder=skill_folder,
            ))
        
        logger.info(f"Parsed {len(skills)} skills from awesome list")
        return skills
    
    async def refresh(self) -> None:
        """Refresh the cached skill list from GitHub."""
        readme = await self._fetch_readme()
        if readme:
            self._skills_cache = self._parse_skill_links(readme)
            self._cache_updated = datetime.now()
            logger.info(f"Refreshed awesome list cache: {len(self._skills_cache)} skills")
    
    async def _ensure_cache(self) -> None:
        """Ensure cache is populated and valid."""
        if not self._is_cache_valid():
            await self.refresh()
    
    def _match_query(self, skill: ParsedSkillLink, query: str) -> float:
        """
        Score how well a skill matches the query.
        
        Returns a score from 0 to 1, higher is better match.
        """
        query_lower = query.lower()
        query_terms = query_lower.split()
        
        # Check name match
        name_lower = skill.name.lower()
        if query_lower == name_lower:
            return 1.0
        if query_lower in name_lower:
            return 0.9
        
        # Check description match
        desc_lower = skill.description.lower()
        if query_lower in desc_lower:
            return 0.7
        
        # Check individual terms
        matches = sum(1 for term in query_terms if term in name_lower or term in desc_lower)
        if matches > 0:
            return 0.5 * (matches / len(query_terms))
        
        return 0.0
    
    async def search(self, query: str, limit: int = 10) -> list[SkillSearchResult]:
        """Search the awesome list for matching skills."""
        if not self._enabled:
            return []
        
        await self._ensure_cache()
        
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
            # Determine the skill ID
            if skill.skill_folder:
                # Extract the last folder name as skill ID
                skill_id = skill.skill_folder.rstrip('/').split('/')[-1]
            else:
                # Use the skill name as ID
                skill_id = skill.name.lower().replace(' ', '-')
            
            results.append(
                SkillSearchResult(
                    id=skill_id,
                    name=skill.name,
                    source=f"{skill.owner}/{skill.repo}",
                    source_registry=self.REGISTRY_NAME,
                    installs=0,  # Unknown for awesome list
                    description=skill.description,
                )
            )
        
        logger.debug(f"awesome-list: '{query}' returned {len(results)} results")
        return results
