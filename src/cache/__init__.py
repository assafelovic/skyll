"""
Cache backends for skill content storage.

Provides pluggable caching with in-memory implementation for MVP
and interface for future Redis/SQLite extensions.
"""

from src.cache.base import CacheBackend
from src.cache.memory import InMemoryCache

__all__ = ["CacheBackend", "InMemoryCache"]
