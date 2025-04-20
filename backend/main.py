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


class BitcoinPriceModel(pa.DataFrameModel):
    Date: str
    Price: float


@tacobi.dataset("/bitcoin-price", DatasetTypeEnum.TABULAR)
async def bitcoin_price() -> DataFrame[BitcoinPriceModel]:
    """
    A dataset that contains information about the price of Bitcoin.
    """

    import numpy as np
    from datetime import datetime, timedelta

    # Generate dates from 2015 to 2025
    start_date = datetime(2015, 1, 1)
    end_date = datetime(2025, 12, 31)
    date_range = [
        start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)
    ]

    # Convert to string format
    date_strings = [date.strftime("%Y-%m-%d") for date in date_range]

    # Generate prices from 0 to 100k with slight randomness
    days_total = len(date_strings)
    base_prices = np.linspace(0, 100000, days_total)
    random_factor = (
        np.random.normal(0, 1, days_total) * 100
    )  # Add noise with standard deviation of 1000
    prices = np.maximum(0, base_prices + random_factor)  # Ensure no negative prices

    return pd.DataFrame({"Date": date_strings, "Price": prices}).pipe(
        DataFrame[BitcoinPriceModel]
    )


if __name__ == "__main__":
    print(tacobi.get_schema().model_dump_json())
    tacobi.run()
