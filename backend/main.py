import pandas as pd
import pandera as pa
from pandera.typing import DataFrame
from tacobi import DatasetTypeEnum, Tacobi

tacobi = Tacobi()


class TestModelDependency(pa.DataFrameModel):
    column1: int


@tacobi.dataset("test_dependency_1", DatasetTypeEnum.TABULAR)
def test_dependency_1() -> DataFrame[TestModelDependency]:
    return pd.DataFrame({"column1": [1, 2, 3]}).pipe(DataFrame[TestModelDependency])


@tacobi.dataset("test_dependency_2", DatasetTypeEnum.TABULAR)
def test_dependency_2() -> DataFrame[TestModelDependency]:
    return pd.DataFrame({"column1": [1, 2, 3]}).pipe(DataFrame[TestModelDependency])


class TestModel(pa.DataFrameModel):
    column2: int


@tacobi.dataset("test", DatasetTypeEnum.TABULAR)
def test() -> DataFrame[TestModel]:
    dep1 = test_dependency_1()
    dep1["column1"] = dep1["column1"] + 1

    dep2 = test_dependency_2()
    dep2["column1"] = dep2["column1"] + 2

    res = dep1.merge(dep2, on="column1")
    return res.pipe(DataFrame[TestModel])


if __name__ == "__main__":
    print(tacobi.get_schema().model_dump_json())
    tacobi.run()
