"""Tests for cache backends."""

import asyncio
import pytest

from src.cache.memory import InMemoryCache


@pytest.fixture
async def cache():
    """Create a fresh cache for each test."""
    cache = InMemoryCache(default_ttl=60, max_size=10)
    yield cache


class TestInMemoryCache:
    """Tests for InMemoryCache."""

    @pytest.mark.asyncio
    async def test_set_and_get(self, cache):
        """Test basic set and get operations."""
        await cache.set("key1", {"value": "test"})
        result = await cache.get("key1")

        assert result == {"value": "test"}

    @pytest.mark.asyncio
    async def test_get_missing_key(self, cache):
        """Test getting a key that doesn't exist."""
        result = await cache.get("nonexistent")

        assert result is None

    @pytest.mark.asyncio
    async def test_delete(self, cache):
        """Test deleting a key."""
        await cache.set("key1", "value")
        deleted = await cache.delete("key1")

        assert deleted is True
        assert await cache.get("key1") is None

    @pytest.mark.asyncio
    async def test_delete_missing_key(self, cache):
        """Test deleting a key that doesn't exist."""
        deleted = await cache.delete("nonexistent")

        assert deleted is False

    @pytest.mark.asyncio
    async def test_exists(self, cache):
        """Test checking if key exists."""
        await cache.set("key1", "value")

        assert await cache.exists("key1") is True
        assert await cache.exists("nonexistent") is False

    @pytest.mark.asyncio
    async def test_clear(self, cache):
        """Test clearing all keys."""
        await cache.set("key1", "value1")
        await cache.set("key2", "value2")
        await cache.clear()

        assert await cache.get("key1") is None
        assert await cache.get("key2") is None

    @pytest.mark.asyncio
    async def test_expiration(self, cache):
        """Test that expired keys are not returned."""
        # Set with very short TTL
        await cache.set("short", "value", ttl=0)

        # Should be expired immediately (ttl=0 means no expiry, use 1)
        cache2 = InMemoryCache(default_ttl=60)
        await cache2.set("short", "value", ttl=1)
        await asyncio.sleep(1.1)

        result = await cache2.get("short")
        assert result is None

    @pytest.mark.asyncio
    async def test_max_size_eviction(self, cache):
        """Test that oldest entries are evicted when at capacity."""
        # Fill cache to max
        for i in range(10):
            await cache.set(f"key{i}", f"value{i}")

        # Add one more
        await cache.set("key_new", "value_new")

        # First key should be evicted
        assert await cache.get("key0") is None
        assert await cache.get("key_new") == "value_new"

    @pytest.mark.asyncio
    async def test_stats(self, cache):
        """Test cache statistics."""
        await cache.set("key1", "value1")
        await cache.get("key1")  # hit
        await cache.get("nonexistent")  # miss

        stats = await cache.stats()

        assert stats["size"] == 1
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["sets"] == 1
        assert stats["hit_rate"] == 50.0

    @pytest.mark.asyncio
    async def test_update_existing_key(self, cache):
        """Test updating an existing key."""
        await cache.set("key1", "value1")
        await cache.set("key1", "value2")

        result = await cache.get("key1")
        assert result == "value2"
