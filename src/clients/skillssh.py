"""
Skills.sh API client for searching the agent skills directory.

skills.sh is Vercel's "npm for AI agents" - a central marketplace for
discovering and installing SKILL.md files across 27+ agent products.
"""

import logging
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)


@dataclass
class SkillSearchResult:
    """
    A single skill result from skills.sh search API.
    
    Attributes:
        id: Skill identifier/slug (e.g., "vercel-react-best-practices")
        name: Display name of the skill
        source: GitHub owner/repo (e.g., "vercel-labs/agent-skills")
        installs: Total install count from telemetry
    """

    id: str
    name: str
    source: str
    installs: int


class SkillsShError(Exception):
    """Base exception for skills.sh API errors."""

    pass


class SkillsShClient:
    """
    Async client for the skills.sh search API.
    
    The skills.sh API provides skill discovery with metadata including
    install counts, which we use for popularity-based ranking.
    
    Args:
        base_url: API base URL (default: https://skills.sh)
        timeout: Request timeout in seconds (default: 10.0)
    
    Example:
        async with SkillsShClient() as client:
            results = await client.search("react performance", limit=5)
            for skill in results:
                print(f"{skill.name}: {skill.installs} installs")
    """

    DEFAULT_BASE_URL = "https://skills.sh"
    SEARCH_ENDPOINT = "/api/search"

    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 10.0,
    ):
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "SkillsShClient":
        """Enter async context, creating HTTP client."""
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
        """Exit async context, closing HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get the HTTP client, raising if not in context."""
        if self._client is None:
            raise RuntimeError(
                "SkillsShClient must be used as async context manager: "
                "async with SkillsShClient() as client: ..."
            )
        return self._client

    async def search(
        self,
        query: str,
        limit: int = 10,
    ) -> list[SkillSearchResult]:
        """
        Search for skills matching a query.
        
        Args:
            query: Search query string (e.g., "react performance")
            limit: Maximum number of results (default: 10)
            
        Returns:
            List of SkillSearchResult objects sorted by relevance
            
        Raises:
            SkillsShError: If API request fails
        """
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
                        installs=skill.get("installs", 0),
                    )
                )

            logger.debug(f"skills.sh search '{query}' returned {len(results)} results")
            return results

        except httpx.HTTPStatusError as e:
            logger.error(f"skills.sh API error: {e.response.status_code}")
            raise SkillsShError(
                f"skills.sh API returned {e.response.status_code}: {e.response.text}"
            ) from e

        except httpx.RequestError as e:
            logger.error(f"skills.sh request failed: {e}")
            raise SkillsShError(f"Failed to reach skills.sh API: {e}") from e

        except Exception as e:
            logger.error(f"Unexpected error searching skills.sh: {e}")
            raise SkillsShError(f"Unexpected error: {e}") from e
