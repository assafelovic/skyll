"""
Async client for the Skyll API.
"""

import httpx

from skyll.models import Skill, SearchResponse


class SkyllError(Exception):
    """Base exception for Skyll client errors."""
    pass


class Skyll:
    """
    Async client for searching and retrieving agent skills.
    
    Uses the hosted Skyll API at api.skyll.app by default.
    
    Args:
        base_url: API base URL (default: https://api.skyll.app)
        timeout: Request timeout in seconds (default: 30.0)
        
    Example:
        async with Skyll() as client:
            # Search for skills
            skills = await client.search("react performance")
            
            # Get a specific skill
            skill = await client.get("vercel-labs/agent-skills", "react-best-practices")
            
            # Search with references
            skills = await client.search("testing", include_references=True)
    """
    
    DEFAULT_BASE_URL = "https://api.skyll.app"
    
    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 30.0,
    ):
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._client: httpx.AsyncClient | None = None
    
    async def __aenter__(self) -> "Skyll":
        """Enter async context, creating HTTP client."""
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=self._timeout,
            headers={
                "Accept": "application/json",
                "User-Agent": "skyll-python/0.1.0",
            },
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Exit async context, closing HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    @property
    def client(self) -> httpx.AsyncClient:
        """Get the HTTP client, raising if not in context."""
        if self._client is None:
            raise RuntimeError(
                "Skyll client must be used as async context manager: "
                "async with Skyll() as client: ..."
            )
        return self._client
    
    async def search(
        self,
        query: str,
        limit: int = 10,
        include_content: bool = True,
        include_raw: bool = False,
        include_references: bool = False,
    ) -> list[Skill]:
        """
        Search for skills matching a query.
        
        Args:
            query: Search query (e.g., "react performance", "testing best practices")
            limit: Maximum number of results (1-50, default: 10)
            include_content: Fetch full SKILL.md content (default: True)
            include_raw: Include raw content with frontmatter (default: False)
            include_references: Fetch reference files (default: False)
            
        Returns:
            List of matching Skill objects, sorted by relevance
            
        Raises:
            SkyllError: If the API request fails
            
        Example:
            skills = await client.search("react performance", limit=5)
            for skill in skills:
                print(f"{skill.title} ({skill.install_count} installs)")
                if skill.content:
                    print(skill.content[:500])
        """
        params = {
            "q": query,
            "limit": limit,
            "include_content": str(include_content).lower(),
            "include_raw": str(include_raw).lower(),
            "include_references": str(include_references).lower(),
        }
        
        try:
            response = await self.client.get("/search", params=params)
            response.raise_for_status()
            data = response.json()
            search_response = SearchResponse(**data)
            return search_response.skills
        except httpx.HTTPStatusError as e:
            raise SkyllError(f"API error: {e.response.status_code} - {e.response.text}") from e
        except httpx.RequestError as e:
            raise SkyllError(f"Request failed: {e}") from e
    
    async def get(
        self,
        source: str,
        skill_id: str,
        include_raw: bool = False,
        include_references: bool = False,
    ) -> Skill | None:
        """
        Get a specific skill by source and ID.
        
        Args:
            source: GitHub owner/repo (e.g., "vercel-labs/agent-skills")
            skill_id: Skill identifier (e.g., "react-best-practices")
            include_raw: Include raw content with frontmatter (default: False)
            include_references: Fetch reference files (default: False)
            
        Returns:
            Skill object if found, None if not found
            
        Raises:
            SkyllError: If the API request fails (except 404)
            
        Example:
            skill = await client.get("anthropics/skills", "skill-creator")
            if skill:
                print(skill.content)
        """
        params = {
            "include_raw": str(include_raw).lower(),
            "include_references": str(include_references).lower(),
        }
        
        try:
            response = await self.client.get(
                f"/skills/{source}/{skill_id}",
                params=params,
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return Skill(**response.json())
        except httpx.HTTPStatusError as e:
            raise SkyllError(f"API error: {e.response.status_code} - {e.response.text}") from e
        except httpx.RequestError as e:
            raise SkyllError(f"Request failed: {e}") from e
    
    async def health(self) -> dict:
        """
        Check API health status.
        
        Returns:
            Health status dict with version and cache stats
            
        Example:
            status = await client.health()
            print(f"API version: {status['version']}")
        """
        try:
            response = await self.client.get("/health")
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise SkyllError(f"Health check failed: {e}") from e
