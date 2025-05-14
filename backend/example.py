"""Test app."""

import polars as pl
import uvicorn
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI, Query
from pandera import DataFrameModel
from pandera.typing import DataFrame
from pydantic import BaseModel

from tacobi import TacoBIApp
from tacobi.data_source import DataSourceManager
from tacobi.view import ViewManager

# Set up the app

app = FastAPI()
view_manager = ViewManager(
    recompute_trigger=IntervalTrigger(seconds=1),
    fastapi_app=app,
)
BI = TacoBIApp(view_manager=view_manager, data_source_manager=DataSourceManager())


class TestDataFrame(DataFrameModel):
    """Test DataFrame."""

    name: str
    age: int


DF = pl.DataFrame({"name": ["John", "Jane"], "age": [30, 25]})


@BI.materialized_view(name="test_data_source", route="/all_people")
async def test_data_source() -> DataFrame[TestDataFrame]:
    """Test data source."""
    return DF.to_pandas().pipe(TestDataFrame)


class PersonModel(BaseModel):
    """Person model."""

    name: str
    age: int


@BI.view(name="test_view", route="/query_person_by_name")
async def test_view(
    name: str = Query(default="John", description="The name of the person to query"),
) -> PersonModel:
    """Test view."""
    queried_df = DF.filter(pl.col("name") == name)
    return PersonModel(**queried_df.to_dicts()[0])


async def main() -> None:
    """Run the app."""
    await BI.start()
    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
