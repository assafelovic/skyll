"""
skills.sh source - the primary skill marketplace.

skills.sh is Vercel's "npm for AI agents" - a central marketplace for
discovering and installing SKILL.md files across 27+ agent products.

Website: https://skills.sh
"""

import logging

import httpx

from src.sources.base import SkillSource, SkillSearchResult

logger = logging.getLogger(__name__)


class SkillsShSource:
    """
    Skill source backed by the skills.sh API.
    
    This is the primary, canonical source for skill discovery.
    It provides real-time search with popularity metrics.
    """
    
    REGISTRY_NAME = "skills.sh"
    DEFAULT_BASE_URL = "https://skills.sh"
    SEARCH_ENDPOINT = "/api/search"
    
    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 10.0,
        enabled: bool = True,
    ):
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._enabled = enabled
        self._client: httpx.AsyncClient | None = None
    
    @property
    def name(self) -> str:
        return self.REGISTRY_NAME
    
    @property
    def enabled(self) -> bool:
        return self._enabled
    
    async def __aenter__(self) -> "SkillsShSource":
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=self._timeout,
            headers={
                "Accept": "application/json",
                "User-Agent": "skyll/0.1.0",
            },
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None
    
    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("SkillsShSource must be used as async context manager")
        return self._client
    
    async def search(self, query: str, limit: int = 10) -> list[SkillSearchResult]:
        """Search skills.sh for matching skills."""
        if not self._enabled:
            return []
        
        try:
            response = await self.client.get(
                self.SEARCH_ENDPOINT,
                params={"q": query, "limit": limit},
            )
            response.raise_for_status()
            data = response.json()
            
            results = []
            for skill in data.get("skills", []):
                results.append(
                    SkillSearchResult(
                        id=skill.get("id", ""),
                        name=skill.get("name", skill.get("id", "")),
                        source=skill.get("topSource", ""),
                        source_registry=self.REGISTRY_NAME,
                        installs=skill.get("installs", 0),
                    )
                )
            
            logger.debug(f"skills.sh: '{query}' returned {len(results)} results")
            return results
            
        except httpx.HTTPStatusError as e:
            logger.error(f"skills.sh API error: {e.response.status_code}")
            return []
        except Exception as e:
            logger.error(f"skills.sh search failed: {e}")
            return []
    
    async def refresh(self) -> None:
        """No-op for API-based source."""
        pass
