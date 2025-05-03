from unittest.mock import MagicMock

import pandera as pa
import pytest
from pandera.typing import DataFrame
from tacobi import DatasetTypeEnum
from tacobi.caching import CacheAdapter


class TestSchema(pa.DataFrameModel):
    column1: int  # type: ignore


@pytest.fixture
def testSchema():
    return TestSchema


@pytest.fixture
def mockCacheAdapter():
    mock_cache = MagicMock(spec=CacheAdapter)
    mock_cache.get.return_value = None
    mock_cache.set.return_value = None
    return mock_cache


@pytest.fixture
def testDecoratedDatasetFactory():
    def factory(tacobi, schema, return_value, cache_validity=None):
        @tacobi.dataset("/test", DatasetTypeEnum.TABULAR, cache_validity=cache_validity)
        def test_dataset() -> DataFrame[schema]:
            return return_value

        return test_dataset

    return factory
