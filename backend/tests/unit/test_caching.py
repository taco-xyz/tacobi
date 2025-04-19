import asyncio
import shutil
import tempfile

import pytest
from tacobi.caching import DiskCacheAdapter


@pytest.fixture
def cache_dir():
    """Create a temporary directory for the cache and clean it up afterward."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def disk_cache(cache_dir):
    """Create a DiskCacheAdapter instance for testing."""
    cache = DiskCacheAdapter(cache_dir=cache_dir)
    yield cache
    # Ensure the cache is closed even if a test fails
    if hasattr(cache, "_cache"):
        cache._cache.close()


# Synchronous tests


def test_set_and_get(disk_cache):
    """Test setting and getting a value from the cache."""
    # Test with a simple string
    assert disk_cache.set("test_key", "test_value")
    assert disk_cache.get("test_key") == "test_value"

    # Test with a more complex object
    complex_obj = {"name": "test", "data": [1, 2, 3]}
    assert disk_cache.set("complex_key", complex_obj)
    assert disk_cache.get("complex_key") == complex_obj


def test_get_missing_key(disk_cache):
    """Test that getting a missing key returns None."""
    assert disk_cache.get("non_existent_key") is None


def test_set_with_ttl(disk_cache):
    """Test setting a value with a TTL."""
    disk_cache.set("expire_key", "will_expire", ttl=1)
    assert disk_cache.get("expire_key") == "will_expire"

    # Sleep for 2 seconds to allow the key to expire
    import time

    time.sleep(2)

    assert disk_cache.get("expire_key") is None


def test_delete(disk_cache):
    """Test deleting a value from the cache."""
    disk_cache.set("delete_me", "value")
    assert disk_cache.get("delete_me") == "value"

    assert disk_cache.delete("delete_me")
    assert disk_cache.get("delete_me") is None

    # Deleting a non-existent key should return False
    assert not disk_cache.delete("non_existent_key")


@pytest.mark.asyncio
async def test_transaction(disk_cache):
    """Test that transactions work correctly."""
    async with disk_cache:
        disk_cache.set("tx_key1", "value1")
        disk_cache.set("tx_key2", "value2")

    assert disk_cache.get("tx_key1") == "value1"
    assert disk_cache.get("tx_key2") == "value2"


@pytest.mark.asyncio
async def test_transaction_rollback(disk_cache):
    """Test that transactions roll back on exceptions."""
    try:
        async with disk_cache:
            disk_cache.set("rollback_key", "temp_value")
            raise ValueError("Forced exception")
    except ValueError:
        pass

    # The key should not be in the cache after rollback
    assert disk_cache.get("rollback_key") is None


@pytest.mark.asyncio
async def test_concurrent_transactions(disk_cache):
    """Test behavior with concurrent transaction attempts."""
    # This test simulates two concurrent transactions

    completed = []

    async def transaction1():
        try:
            async with disk_cache:
                # Simulate some work
                await asyncio.sleep(0.5)
                disk_cache.set("tx1_key", "tx1_value")
                completed.append(1)
        except Exception as e:
            return e

    async def transaction2():
        try:
            # Give transaction1 time to start
            await asyncio.sleep(0.1)
            async with disk_cache:
                # This should wait until transaction1 completes
                disk_cache.set("tx2_key", "tx2_value")
                completed.append(2)
        except Exception as e:
            return e

    # Run both transactions concurrently
    results = await asyncio.gather(
        transaction1(), transaction2(), return_exceptions=True
    )

    # Both transactions should complete without exceptions
    assert all(result is None for result in results)

    # Check that both transactions were processed
    assert disk_cache.get("tx1_key") == "tx1_value"
    assert disk_cache.get("tx2_key") == "tx2_value"

    # Check that they were processed sequentially
    assert completed == [1, 2]
