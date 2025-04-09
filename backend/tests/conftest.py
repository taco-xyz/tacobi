import pandera as pa
import pytest
from pandera.typing import DataFrame
from tacobi import DatasetTypeEnum


@pytest.fixture
def testSchema():
    class TestSchema(pa.DataFrameModel):
        column1: int  # type: ignore

    return TestSchema


@pytest.fixture
def testDecoratedDatasetFactory():
    def factory(tacobi, schema, return_value):
        @tacobi.dataset("/test", DatasetTypeEnum.TABULAR)
        def test_dataset() -> DataFrame[schema]:
            return return_value

        return test_dataset

    return factory
