"""
Abstract cache backend interface.

Designed for easy extension to Redis, SQLite, or other backends.
"""

from abc import ABC, abstractmethod
from typing import Any


class CacheBackend(ABC):
    """
    Abstract base class for cache backends.
    
    Implementations must provide get/set/delete operations with TTL support.
    This abstraction allows swapping in-memory cache for Redis or SQLite
    without changing core service logic.
    
    Example:
        cache = InMemoryCache(default_ttl=3600)
        cache.set("skill:vercel-react", skill_content)
        content = cache.get("skill:vercel-react")
    """

    @abstractmethod
    async def get(self, key: str) -> Any | None:
        """
        Retrieve a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value if exists and not expired, None otherwise
        """
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        """
        Store a value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (None uses backend default)
        """
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Remove a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if key existed and was deleted, False otherwise
        """
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if key exists and is not expired
        """
        pass

    @abstractmethod
    async def clear(self) -> None:
        """Clear all cached values."""
        pass

    @abstractmethod
    async def stats(self) -> dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache metrics (hits, misses, size, etc.)
        """
        pass
