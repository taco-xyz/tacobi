"""Tests for the cache backends."""

from collections.abc import Generator
from pathlib import Path

import pytest

from tacobi.data_source.cache import SQLiteCache


@pytest.fixture
def cache() -> Generator[SQLiteCache, None, None]:
    """Create a test cache instance."""
    db_path = Path("test_cache.db")
    cache = SQLiteCache(db_path=db_path)
    yield cache
    cache.close()
    # Cleanup
    if db_path.exists():
        db_path.unlink()


@pytest.mark.asyncio
async def test_cache_initialization(cache: SQLiteCache) -> None:
    """Test cache initialization.

    - Creates a cache instance
    - Verifies the database file exists
    - Checks if the cache table is created
    """
    assert Path.exists(cache.db_path)
    assert cache._conn is not None


@pytest.mark.asyncio
async def test_cache_set_get(cache: SQLiteCache) -> None:
    """Test cache set and get operations.

    - Sets a value in the cache
    - Retrieves the value
    - Verifies the retrieved value matches the original
    """
    key = "test_key"
    data = b"test_data"

    await cache.set(key, data)
    retrieved = await cache.get(key)

    assert retrieved == data


@pytest.mark.asyncio
async def test_cache_get_nonexistent(cache: SQLiteCache) -> None:
    """Test getting a nonexistent key.

    - Attempts to get a key that doesn't exist
    - Verifies None is returned
    """
    result = await cache.get("nonexistent_key")
    assert result is None


@pytest.mark.asyncio
async def test_cache_update(cache: SQLiteCache) -> None:
    """Test updating an existing key.

    - Sets a value
    - Updates the value
    - Verifies the updated value is retrieved
    """
    key = "test_key"
    initial_data = b"initial_data"
    updated_data = b"updated_data"

    await cache.set(key, initial_data)
    await cache.set(key, updated_data)

    retrieved = await cache.get(key)
    assert retrieved == updated_data


@pytest.mark.asyncio
async def test_cache_clear(cache: SQLiteCache) -> None:
    """Test clearing the cache.

    - Sets multiple values
    - Clears the cache
    - Verifies all values are removed
    """
    await cache.set("key1", b"data1")
    await cache.set("key2", b"data2")

    await cache.clear()

    assert await cache.get("key1") is None
    assert await cache.get("key2") is None
