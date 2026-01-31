"""
Base protocol for skill sources.

All skill sources (skills.sh, awesome lists, custom registries)
implement this protocol to provide consistent skill discovery.
"""

from abc import abstractmethod
from dataclasses import dataclass
from typing import Protocol


@dataclass
class SkillSearchResult:
    """
    A skill result from any source.
    
    Attributes:
        id: Skill identifier/slug (e.g., "react-best-practices")
        name: Display name of the skill
        source: GitHub owner/repo (e.g., "vercel-labs/agent-skills")
        source_registry: Which registry found this (e.g., "skills.sh", "awesome-list")
        installs: Install count if available (0 if unknown)
        description: Short description if available
        url: Direct URL to the skill if known
    """
    id: str
    name: str
    source: str  # GitHub owner/repo
    source_registry: str  # Which registry (skills.sh, awesome-list, etc.)
    installs: int = 0
    description: str | None = None
    url: str | None = None
    
    @property
    def unique_key(self) -> str:
        """Unique key for deduplication across sources."""
        return f"{self.source}/{self.id}".lower()


class SkillSource(Protocol):
    """
    Protocol for skill discovery sources.
    
    Implementations should provide async context manager support
    and a search method that returns matching skills.
    """
    
    @property
    def name(self) -> str:
        """Human-readable name of this source."""
        ...
    
    @property
    def enabled(self) -> bool:
        """Whether this source is currently enabled."""
        ...
    
    async def __aenter__(self) -> "SkillSource":
        """Enter async context."""
        ...
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Exit async context."""
        ...
    
    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> list[SkillSearchResult]:
        """
        Search for skills matching a query.
        
        Args:
            query: Search query string
            limit: Maximum results to return
            
        Returns:
            List of matching skills
        """
        ...
    
    @abstractmethod
    async def refresh(self) -> None:
        """
        Refresh cached data from this source.
        
        For API sources, this may be a no-op.
        For list-based sources, this fetches the latest list.
        """
        ...
