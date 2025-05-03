from datetime import timedelta

import pandas as pd
import pandera as pa
from pandera.typing import DataFrame
import pytest
from fastapi import FastAPI
from tacobi import Tacobi
from tacobi.schema import DatasetTypeEnum
from tests.conftest import TestSchema  # Import TestSchema from conftest instead


def test_tacobi_initialization():
    # Test initialization with default FastAPI app
    tacobi = Tacobi()
    assert isinstance(tacobi._fastapi_app, FastAPI)
    assert len(tacobi._datasets) == 0

    # Test initialization with custom FastAPI app
    custom_app = FastAPI()
    tacobi = Tacobi(fastapi_app=custom_app)
    assert tacobi._fastapi_app == custom_app


def test_dataset_decorator(testSchema, testDecoratedDatasetFactory):
    tacobi = Tacobi()
    dataset = testDecoratedDatasetFactory(
        tacobi, testSchema, pd.DataFrame({"column1": [1, 2, 3]})
    )

    assert len(tacobi._datasets) == 1
    dataset = tacobi._datasets[0]
    assert dataset.id == "test_dataset"
    assert dataset.route == "/test"
    assert dataset.type == DatasetTypeEnum.TABULAR


def test_dataset_validation(testSchema, testDecoratedDatasetFactory):
    tacobi = Tacobi()
    dataset = testDecoratedDatasetFactory(
        tacobi, testSchema, pd.DataFrame({"column1": [1, 2, "three"]})
    )

    assert len(tacobi._datasets) == 1
    dataset = tacobi._datasets[0]
    func = dataset.function

    with pytest.raises(pa.errors.SchemaError):
        func()


def test_get_schema(testSchema, testDecoratedDatasetFactory):
    tacobi = Tacobi()
    testDecoratedDatasetFactory(
        tacobi, testSchema, pd.DataFrame({"column1": [1, 2, 3]})
    )

    schema = tacobi.get_schema()
    assert len(schema.datasets) == 1
    assert schema.datasets[0].id == "test_dataset"


def test_dataset_with_cache(testSchema, testDecoratedDatasetFactory, mockCacheAdapter):
    """Test that dataset caching works."""
    tacobi = Tacobi(cache_adapter=mockCacheAdapter)
    testDecoratedDatasetFactory(
        tacobi,
        testSchema,
        pd.DataFrame({"column1": [1, 2, 3]}),
        cache_validity=timedelta(minutes=1),
    )

    dataset = tacobi._datasets[0]
    func = dataset.function

    result1 = func()

    assert mockCacheAdapter.get.call_count == 1
    assert mockCacheAdapter.set.call_count == 1


def test_cache_hit(testSchema, mockCacheAdapter, testDecoratedDatasetFactory):
    """Test cache hit scenario."""
    # Configure the mock to return a cached value
    test_df = pd.DataFrame({"column1": [10, 20, 30]})
    mockCacheAdapter.get.return_value = test_df

    tacobi = Tacobi(cache_adapter=mockCacheAdapter)
    dataset_function = testDecoratedDatasetFactory(
        tacobi,
        testSchema,
        pd.DataFrame({"column1": [1, 2, 3]}),
        cache_validity=timedelta(minutes=5),
    )

    # First call should check cache and find a value
    result = dataset_function()

    # Verify we got the cached value
    assert result.equals(test_df)
    mockCacheAdapter.get.assert_called_once_with("test_dataset")
    # Set should not be called on a cache hit
    mockCacheAdapter.set.assert_not_called()


def test_cache_miss_then_hit(testSchema, mockCacheAdapter):
    """Test cache miss followed by a hit."""
    # Configure the mock to return None first (miss), then cache the value
    mockCacheAdapter.get.return_value = None

    tacobi = Tacobi(cache_adapter=mockCacheAdapter)

    original_df = pd.DataFrame({"column1": [1, 2, 3]})

    @tacobi.dataset(
        "/test-cache-miss", DatasetTypeEnum.TABULAR, cache_validity=timedelta(minutes=5)
    )
    def dataset_function() -> DataFrame[TestSchema]:
        return original_df

    # First call should check cache, miss, and set the cache
    result1 = dataset_function()
    assert result1.equals(original_df)
    mockCacheAdapter.get.assert_called_once_with("dataset_function")
    mockCacheAdapter.set.assert_called_once()

    # Reset the mock and set up for a hit
    mockCacheAdapter.get.reset_mock()
    mockCacheAdapter.set.reset_mock()
    mockCacheAdapter.get.return_value = original_df

    # Second call should hit the cache
    result2 = dataset_function()
    assert result2.equals(original_df)
    mockCacheAdapter.get.assert_called_once_with("dataset_function")
    mockCacheAdapter.set.assert_not_called()


def test_no_cache_when_ttl_none(testSchema, mockCacheAdapter):
    """Test that no caching occurs when cache_validity is None."""
    tacobi = Tacobi(cache_adapter=mockCacheAdapter)

    @tacobi.dataset("/test-no-cache", DatasetTypeEnum.TABULAR, cache_validity=None)
    def dataset_function() -> DataFrame[TestSchema]:
        return pd.DataFrame({"column1": [1, 2, 3]})

    # Call the function
    result = dataset_function()

    # Verify cache wasn't used
    mockCacheAdapter.get.assert_not_called()
    mockCacheAdapter.set.assert_not_called()


def test_cache_ttl_passed_correctly(testSchema, mockCacheAdapter):
    """Test that TTL is passed correctly to the cache adapter."""
    tacobi = Tacobi(cache_adapter=mockCacheAdapter)

    # 2 minutes cache validity
    cache_validity = timedelta(minutes=2)
    expected_seconds = cache_validity.total_seconds()

    @tacobi.dataset("/test-ttl", DatasetTypeEnum.TABULAR, cache_validity=cache_validity)
    def dataset_function() -> DataFrame[TestSchema]:
        return pd.DataFrame({"column1": [1, 2, 3]})

    # Call the function (will miss and set)
    result = dataset_function()

    # Verify the TTL was passed correctly
    mockCacheAdapter.set.assert_called_once()
    # Check the third argument to set() is the expected TTL in seconds
    call_args = mockCacheAdapter.set.call_args[0]
    assert len(call_args) >= 3
    assert call_args[2] == expected_seconds
