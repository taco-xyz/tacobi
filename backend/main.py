import os

import pandas as pd
import pandera as pa
from pandera.typing import DataFrame
from tacobi import DatasetTypeEnum, Tacobi

current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)


tacobi = Tacobi()


# Market Stats


class MarketStatsModel(pa.DataFrameModel):
    market_key: str
    block_time_day: str
    market_supply_assets_USD: float
    market_borrow_assets_USD: float
    MORPHO_tokens_supply: float
    MORPHO_tokens_borrow: float
    MORPHO_dollars_supply: float
    MORPHO_dollars_borrow: float


market_stats_df = pd.read_csv(
    "morpho-datasets/market_stats.csv",
)


@tacobi.dataset("/market-stats", DatasetTypeEnum.TABULAR)
async def market_stats() -> DataFrame[MarketStatsModel]:
    """
    A dataset that contains market statistics from market_stats.csv.
    """
    return market_stats_df.pipe(DataFrame[MarketStatsModel])


# Protocol Stats


class ProtocolStatsModel(pa.DataFrameModel):
    block_time_day: str
    market_supply_assets_USD: float
    market_borrow_assets_USD: float
    MORPHO_tokens_supply: float
    MORPHO_tokens_borrow: float
    MORPHO_dollars_supply: float
    MORPHO_dollars_borrow: float
    vaults_revenue: float


protocol_stats_df = pd.read_csv(
    "morpho-datasets/protocol_stats.csv",
)


@tacobi.dataset("/protocol-stats", DatasetTypeEnum.TABULAR)
async def protocol_stats() -> DataFrame[ProtocolStatsModel]:
    """
    A dataset that contains protocol statistics from protocol_stats.csv.
    """
    return protocol_stats_df.pipe(DataFrame[ProtocolStatsModel])


# Markets Current Stats


class MarketsCurrentModel(pa.DataFrameModel):
    market_address: str
    supply_assets_USD: float
    borrow_assets_USD: float
    liquidity_assets_USD: float
    utilization: float
    morpho_tokens: float
    morpho_tokens_cumulative: float
    borrow_asset_symbol: str
    supply_asset_symbol: str


markets_current_df = pd.read_csv(
    "morpho-datasets/markets_current.csv",
)

# Replace empty strings and NaN values with "None" for asset symbols
markets_current_df["borrow_asset_symbol"] = markets_current_df[
    "borrow_asset_symbol"
].fillna("None")
markets_current_df["supply_asset_symbol"] = markets_current_df[
    "supply_asset_symbol"
].fillna("None")


@tacobi.dataset("/markets-current", DatasetTypeEnum.TABULAR)
async def markets_current() -> DataFrame[MarketsCurrentModel]:
    """
    A dataset that contains current market statistics from markets_current.csv.
    """
    return markets_current_df.pipe(DataFrame[MarketsCurrentModel])


if __name__ == "__main__":
    print(tacobi.get_schema().model_dump_json())
    tacobi.run()
