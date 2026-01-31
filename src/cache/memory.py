"""
In-memory cache backend implementation.

Simple, fast, no external dependencies. Perfect for development and MVP.
Data is lost on restart - use Redis backend for production persistence.
"""

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any

from src.cache.base import CacheBackend


@dataclass
class CacheEntry:
    """A single cache entry with expiration tracking."""

    value: Any
    expires_at: float | None = None

    def is_expired(self) -> bool:
        """Check if this entry has expired."""
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at


@dataclass
class CacheStats:
    """Cache performance statistics."""

    hits: int = 0
    misses: int = 0
    sets: int = 0
    deletes: int = 0
    evictions: int = 0


class InMemoryCache(CacheBackend):
    """
    Thread-safe in-memory cache with TTL support.
    
    Features:
    - Automatic expiration of stale entries
    - Optional max size with LRU-style eviction
    - Performance statistics tracking
    - Async-compatible (uses locks for thread safety)
    
    Args:
        default_ttl: Default time-to-live in seconds (default: 1 hour)
        max_size: Maximum number of entries (None = unlimited)
        cleanup_interval: Seconds between automatic cleanup runs (default: 5 min)
    
    Example:
        cache = InMemoryCache(default_ttl=3600, max_size=1000)
        await cache.set("key", {"data": "value"})
        result = await cache.get("key")
    """

    def __init__(
        self,
        default_ttl: int = 3600,
        max_size: int | None = None,
        cleanup_interval: int = 300,
    ):
        self._store: dict[str, CacheEntry] = {}
        self._default_ttl = default_ttl
        self._max_size = max_size
        self._cleanup_interval = cleanup_interval
        self._stats = CacheStats()
        self._lock = asyncio.Lock()
        self._cleanup_task: asyncio.Task | None = None

    async def start(self) -> None:
        """Start background cleanup task."""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def stop(self) -> None:
        """Stop background cleanup task."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None

    async def _cleanup_loop(self) -> None:
        """Periodically remove expired entries."""
        while True:
            await asyncio.sleep(self._cleanup_interval)
            await self._cleanup_expired()

    async def _cleanup_expired(self) -> None:
        """Remove all expired entries."""
        async with self._lock:
            expired_keys = [
                key for key, entry in self._store.items() if entry.is_expired()
            ]
            for key in expired_keys:
                del self._store[key]
                self._stats.evictions += 1

    async def get(self, key: str) -> Any | None:
        """
        Retrieve a value from cache.
        
        Returns None if key doesn't exist or has expired.
        Expired entries are cleaned up on access.
        """
        async with self._lock:
            entry = self._store.get(key)

            if entry is None:
                self._stats.misses += 1
                return None

            if entry.is_expired():
                del self._store[key]
                self._stats.misses += 1
                self._stats.evictions += 1
                return None

            self._stats.hits += 1
            return entry.value

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        """
        Store a value in cache with optional TTL.
        
        If max_size is set and cache is full, oldest entries are evicted.
        """
        ttl = ttl if ttl is not None else self._default_ttl
        expires_at = time.time() + ttl if ttl > 0 else None

        async with self._lock:
            # Evict oldest if at capacity
            if self._max_size and len(self._store) >= self._max_size:
                if key not in self._store:
                    # Remove oldest entry (first item in dict - Python 3.7+ preserves order)
                    oldest_key = next(iter(self._store))
                    del self._store[oldest_key]
                    self._stats.evictions += 1

            self._store[key] = CacheEntry(value=value, expires_at=expires_at)
            self._stats.sets += 1

    async def delete(self, key: str) -> bool:
        """Remove a specific key from cache."""
        async with self._lock:
            if key in self._store:
                del self._store[key]
                self._stats.deletes += 1
                return True
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists and is not expired."""
        async with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return False
            if entry.is_expired():
                del self._store[key]
                self._stats.evictions += 1
                return False
            return True

    async def clear(self) -> None:
        """Remove all entries from cache."""
        async with self._lock:
            self._store.clear()

    async def stats(self) -> dict[str, Any]:
        """
        Get cache performance statistics.
        
        Returns:
            Dictionary containing:
            - size: Current number of entries
            - hits: Successful cache retrievals
            - misses: Failed cache retrievals
            - sets: Total set operations
            - deletes: Manual deletions
            - evictions: Automatic removals (expired/capacity)
            - hit_rate: Percentage of hits vs total gets
        """
        async with self._lock:
            total_gets = self._stats.hits + self._stats.misses
            hit_rate = (self._stats.hits / total_gets * 100) if total_gets > 0 else 0.0

            return {
                "size": len(self._store),
                "max_size": self._max_size,
                "hits": self._stats.hits,
                "misses": self._stats.misses,
                "sets": self._stats.sets,
                "deletes": self._stats.deletes,
                "evictions": self._stats.evictions,
                "hit_rate": round(hit_rate, 2),
            }
