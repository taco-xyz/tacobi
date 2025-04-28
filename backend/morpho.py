import os

import pandas as pd
import pandera as pa
from pandera.typing import DataFrame
from tacobi import DatasetTypeEnum, Tacobi

tacobi = Tacobi()

# Set current directory so that we can easily import datasets.
current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)

## ====================================
## KPI Cards #1
## 1. Morpho Daily Prices
## 2. Morpho TVL
## 3. Morpho Cumulative Rewards Awarded
## ====================================

# Daily token Prices

MORPHO_DAILY_PRICES = pd.read_csv("datasets/morpho_daily_prices.csv")


class MorphoDailyPricesModel(pa.DataFrameModel):
    asset_symbol: str
    block_time_day: str
    price: float
    asset_chain: int


@tacobi.dataset("/morpho-daily-prices", DatasetTypeEnum.TABULAR)
async def morpho_daily_prices() -> DataFrame[MorphoDailyPricesModel]:
    return MORPHO_DAILY_PRICES


# TVL

MORPHO_TVL = pd.read_csv("datasets/morpho_tvl.csv")


class MorphoTvlModel(pa.DataFrameModel):
    block_time_day: str
    tvl_usd: float


@tacobi.dataset("/morpho-tvl", DatasetTypeEnum.TABULAR)
async def morpho_tvl() -> DataFrame[MorphoTvlModel]:
    return MORPHO_TVL


# Cumulative Rewards Awarded

MORPHO_REWARDS = pd.read_csv("datasets/morpho_rewards.csv")


class MorphoRewardsModel(pa.DataFrameModel):
    block_time_day: str
    MORPHO_tokens_supply: float
    MORPHO_tokens_borrow: float
    MORPHO_tokens_cumulative: float
    MORPHO_dollars_cumulative: float


@tacobi.dataset("/morpho-rewards", DatasetTypeEnum.TABULAR)
async def morpho_rewards() -> DataFrame[MorphoRewardsModel]:
    return MORPHO_REWARDS


## ====================================
## Graph #1
## This graph includes:
## - Total Borrow
## - Total Supply
## - Daily Borrower Rewards Awarded
## - Daily Supplier Rewards Awarded
## ====================================

# Total Borrow

MORPHO_BORROW_SUPPLY_REWARDS = pd.read_csv("datasets/borrow_supply_rewards.csv")


class MorphoBorrowSupplyRewardsModel(pa.DataFrameModel):
    block_time_day: str
    market_supply_assets_USD: float
    market_borrow_assets_USD: float
    MORPHO_tokens_supply: float
    MORPHO_tokens_borrow: float
    MORPHO_dollars_supply: float
    MORPHO_dollars_borrow: float
    vaults_revenue: float


@tacobi.dataset("/borrow-supply-rewards", DatasetTypeEnum.TABULAR)
async def borrow_supply_rewards() -> DataFrame[MorphoBorrowSupplyRewardsModel]:
    return MORPHO_BORROW_SUPPLY_REWARDS


## ====================================
## Graph #2
## This graph includes:
## - Curators
## - Vaults
## - Markets
## ====================================

# Curators, Vaults, Markets
MORPHO_CURATORS_VAULTS_MARKETS = pd.read_csv(
    "datasets/curators_vaults_markets_counts.csv"
)


class MorphoCuratorsVaultsMarketsModel(pa.DataFrameModel):
    block_time_day: str
    curator_count: int
    market_count: int
    vault_count: int


@tacobi.dataset("/curators-vaults-markets", DatasetTypeEnum.TABULAR)
async def curators_vaults_markets() -> DataFrame[MorphoCuratorsVaultsMarketsModel]:
    return MORPHO_CURATORS_VAULTS_MARKETS


if __name__ == "__main__":
    print(tacobi.get_schema().model_dump_json())
    tacobi.run()
