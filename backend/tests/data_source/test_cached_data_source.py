"""Tests for the CachedDataSource and DataSourceScheduler classes."""

import asyncio
from datetime import UTC, datetime

import polars as pl
import pytest
from apscheduler.triggers.interval import IntervalTrigger
from pydantic import BaseModel

from tacobi.streaming.data_source.cache import CacheBackend, SQLiteCache
from tacobi.streaming.data_source.encode import PolarsEncoder, PydanticEncoder
from tacobi.streaming.data_source.models import CachedDataSource, DataSourceScheduler


# Test Models
class TestPydanticModel(BaseModel):
    """Test model for Pydantic tests."""

    value: int
    timestamp: datetime


# Test Data Sources


async def polars_source_function(current: pl.LazyFrame | None) -> pl.LazyFrame:
    """Test data source that returns a Polars DataFrame."""
    if current is None:
        return pl.LazyFrame({"value": [1, 2, 3]})
    return current


async def pydantic_source_function(
    current: TestPydanticModel | None,
) -> TestPydanticModel:
    """Test data source that returns a Pydantic model."""
    if current is None:
        return TestPydanticModel(value=42, timestamp=datetime.now(UTC))
    return current


# Test Fixtures


@pytest.fixture
def cache() -> CacheBackend:
    """Create a test cache instance."""
    return SQLiteCache(db_path="test_cache.db")


@pytest.fixture
def scheduler(cache: CacheBackend) -> DataSourceScheduler:
    """Create a test scheduler instance."""
    return DataSourceScheduler(cache_backend=cache)


# Data Source


@pytest.mark.asyncio
async def test_cached_data_source_polars_initialization(cache: CacheBackend) -> None:
    """Test CachedDataSource initialization with Polars encoder."""
    data_source = CachedDataSource(
        name="test_polars",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    assert data_source.name == "test_polars"
    assert isinstance(data_source._encoder, PolarsEncoder)
    assert data_source._cached_data is None


@pytest.mark.asyncio
async def test_cached_data_source_pydantic_initialization(cache: CacheBackend) -> None:
    """Test CachedDataSource initialization with Pydantic encoder."""
    data_source = CachedDataSource(
        name="test_pydantic",
        function=pydantic_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    assert data_source.name == "test_pydantic"
    assert isinstance(data_source._encoder, PydanticEncoder)
    assert data_source._cached_data is None


@pytest.mark.asyncio
async def test_cached_data_source_update(cache: CacheBackend) -> None:
    """Test CachedDataSource update functionality."""
    data_source = CachedDataSource(
        name="test_update",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    await data_source.update()
    assert data_source._cached_data is not None

    # Verify data was stored in cache
    cached_data = await cache.get("test_update")
    assert cached_data is not None


@pytest.mark.asyncio
async def test_cached_data_source_load(cache: CacheBackend) -> None:
    """Test CachedDataSource load functionality."""
    data_source = CachedDataSource(
        name="test_load",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    # First update to store data
    await data_source.update()
    original_data: pl.LazyFrame = data_source._cached_data

    # Clear in-memory data
    data_source._cached_data = None

    # Load from cache
    await data_source.load()
    assert original_data.collect().equals(data_source._cached_data.collect())


@pytest.mark.asyncio
async def test_cached_data_source_get_latest_data(cache: CacheBackend) -> None:
    """Test CachedDataSource get_latest_data functionality."""
    data_source = CachedDataSource(
        name="test_latest",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    # Initially no data
    assert data_source.get_latest_data() is None

    # Update and verify data
    await data_source.update()
    latest_data = data_source.get_latest_data()
    assert isinstance(latest_data, pl.LazyFrame)


# Scheduler


@pytest.mark.asyncio
async def test_scheduler_add_data_source(
    scheduler: DataSourceScheduler, cache: CacheBackend
) -> None:
    """Test DataSourceScheduler add_data_source functionality."""
    data_source = CachedDataSource(
        name="test_scheduler",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    scheduler.add_data_source(data_source)
    assert len(scheduler._data_sources) == 1
    assert scheduler._data_sources[0] == data_source


@pytest.mark.asyncio
async def test_scheduler_start(
    scheduler: DataSourceScheduler, cache: CacheBackend
) -> None:
    """Test DataSourceScheduler start functionality."""
    data_source = CachedDataSource(
        name="test_start",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )
    data_source.set_cache_backend(cache)

    scheduler.add_data_source(data_source)
    await scheduler.start()

    # Wait for first update
    await asyncio.sleep(1.1)

    # Verify data was updated
    assert data_source._cached_data is not None
    latest_data = data_source.get_latest_data()
    assert isinstance(latest_data, pl.LazyFrame)


@pytest.mark.asyncio
async def test_scheduler_multiple_data_sources(scheduler: DataSourceScheduler) -> None:
    """Test DataSourceScheduler with multiple data sources."""
    polars_source = CachedDataSource(
        name="test_polars",
        function=polars_source_function,
        trigger=IntervalTrigger(seconds=1),
    )

    pydantic_source = CachedDataSource(
        name="test_pydantic",
        function=pydantic_source_function,
        trigger=IntervalTrigger(seconds=1),
    )

    scheduler.add_data_source(polars_source)
    scheduler.add_data_source(pydantic_source)

    await scheduler.start()
    await asyncio.sleep(1.1)

    # Verify both sources were updated
    assert polars_source._cached_data is not None
    assert pydantic_source._cached_data is not None

    polars_data = polars_source.get_latest_data()
    pydantic_data = pydantic_source.get_latest_data()

    assert isinstance(polars_data, pl.LazyFrame)
    assert isinstance(pydantic_data, TestPydanticModel)
