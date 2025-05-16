"""Tests for view declarations using decorators."""

import pytest
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from pydantic import BaseModel

from tacobi.bi_app import TacoBIApp
from tacobi.view import ViewManager


class MockDataModel(BaseModel):
    """Mock data model for testing."""

    value: int


class DerivedDataModel(BaseModel):
    """Mock derived data model for testing."""

    original_value: int
    doubled_value: int


@pytest.fixture
def fastapi_app() -> FastAPI:
    """Fixture providing a FastAPI instance."""
    return FastAPI()


@pytest.fixture
def view_manager(fastapi_app: FastAPI) -> ViewManager:
    """Fixture providing a ViewManager instance."""
    trigger = IntervalTrigger(seconds=1)
    return ViewManager(recompute_trigger=trigger, fastapi_app=fastapi_app)


@pytest.mark.asyncio
async def test_materialized_view_declarations(view_manager: ViewManager) -> None:
    """Test declaring materialized views with dependencies using decorators."""
    app = TacoBIApp(view_manager=view_manager)
    value = 42

    # First materialized view
    @app.materialized_view()
    async def base_view() -> MockDataModel:
        return MockDataModel(value=value)

    # Second materialized view depending on the first
    @app.materialized_view(dependencies=[base_view])
    async def derived_view() -> DerivedDataModel:
        base_data = base_view()
        assert base_data is not None
        return DerivedDataModel(
            original_value=base_data.value,
            doubled_value=base_data.value * 2,
        )

    # Start the app to trigger recomputation
    await app.start()

    # Check the results
    base_result = base_view()
    assert base_result is not None
    assert base_result.value == value

    derived_result = derived_view()
    assert derived_result is not None
    assert derived_result.original_value == value
    assert derived_result.doubled_value == value * 2

    # Clean up
    await app.stop()
