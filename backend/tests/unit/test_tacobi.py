import pandas as pd
import pandera as pa
import pytest
from fastapi import FastAPI
from tacobi import Tacobi
from tacobi.schema import DatasetTypeEnum


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
