"""Test app."""

import asyncio

import polars as pl
import uvicorn
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI, Query
from pandera import DataFrameModel
from pandera.typing import DataFrame
from pydantic import BaseModel

from tacobi import TacoBIApp, ViewManager

app = FastAPI()
view_manager = ViewManager(
    recompute_trigger=IntervalTrigger(seconds=5), fastapi_app=app
)
BI = TacoBIApp(
    view_manager=view_manager,
)


class TestSchema(DataFrameModel):
    """Test schema."""

    name: str
    age: int


@BI.materialized_view(name="test_materialized_view", route="/test_materialized_view")
async def test_materialized_view_func() -> DataFrame[TestSchema]:
    """Test materialized view function."""
    return TestSchema.validate(
        pl.DataFrame({"name": ["John", "Jane"], "age": [30, 25]}).to_pandas()
    )


class TestBaseModel(BaseModel):
    """Test base model."""

    name: str
    age: int


@BI.materialized_view(
    name="test_materialized_pydantic_view", route="/test_materialized_pydantic_view"
)
async def test_materialized_pydantic_view_func() -> TestBaseModel:
    """Test materialized pydantic view function."""
    return TestBaseModel(name="John", age=30)


# Normal View ----------------------------------------------------------------


@BI.view(
    name="test_normal_view",
    route="/test_normal_view",
    dependencies=[],
)
async def test_normal_view_func(
    name: str | None = Query(
        default=None,
        description="Name of the person",
    ),
    age: int | None = Query(
        default=None,
        description="Age of the person",
    ),
) -> TestBaseModel:
    """Test normal view function."""
    return TestBaseModel(name=name, age=age)


schema = BI.view_manager.schema
print(f"SCHEMA: {schema}")


async def main() -> None:
    """Start the app."""
    await BI.start()
    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
