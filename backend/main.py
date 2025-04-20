import pandas as pd
import pandera as pa
from pandera.typing import DataFrame
from tacobi import DatasetTypeEnum, Tacobi

tacobi = Tacobi()


class BeverageModel(pa.DataFrameModel):
    Beverage: str
    Price: float


@tacobi.dataset("/dataset-1", DatasetTypeEnum.TABULAR)
async def dataset_1() -> DataFrame[BeverageModel]:
    """
    A dataset that contains information about beverages and their prices.
    """

    return pd.DataFrame(
        {"Beverage": ["Coffee", "Tea", "Soda"], "Price": [3.5, 2.5, 2.0]}
    ).pipe(DataFrame[BeverageModel])


class CocktailModel(pa.DataFrameModel):
    Cocktail: str


@tacobi.dataset("/dataset-2", DatasetTypeEnum.TABULAR)
async def dataset_2() -> DataFrame[CocktailModel]:
    """
    A dataset that contains information about cocktails.
    """

    return pd.DataFrame({"Cocktail": ["Margarita", "Mojito", "Old Fashioned"]}).pipe(
        DataFrame[CocktailModel]
    )


if __name__ == "__main__":
    print(tacobi.get_schema().model_dump_json())
    tacobi.run()
