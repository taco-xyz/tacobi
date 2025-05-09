"""Tests for view implementations."""

from collections.abc import Awaitable, Callable

import pytest
from pydantic import BaseModel

from tacobi.view import MaterializedView, View


class MockDataModel(BaseModel):
    """Mock data model for testing."""

    value: int


@pytest.fixture
def mock_view_function() -> Callable[[], Awaitable[MockDataModel]]:
    """Fixture providing a mock view function."""

    async def _mock_function() -> MockDataModel:
        return MockDataModel(value=42)

    return _mock_function


@pytest.fixture
def mock_view(mock_view_function: Callable[[], Awaitable[MockDataModel]]) -> View:
    """Fixture providing a mock view."""
    return View(name="mock_view", function=mock_view_function, dependencies=[])


@pytest.fixture
def mock_materialized_view(
    mock_view_function: Callable[[], Awaitable[MockDataModel]],
) -> MaterializedView:
    """Fixture providing a mock materialized view."""
    return MaterializedView(
        name="mock_materialized_view",
        function=mock_view_function,
        dependencies=[],
    )


@pytest.mark.asyncio
async def test_get_latest_data_initial(
    mock_materialized_view: MaterializedView,
) -> None:
    """Test getting latest data before recomputation."""
    assert mock_materialized_view.get_latest_data() is None


@pytest.mark.asyncio
async def test_recompute_latest_data(mock_materialized_view: MaterializedView) -> None:
    """Test recomputing latest data."""
    await mock_materialized_view.recompute_latest_data()
    data: MockDataModel = mock_materialized_view.get_latest_data()
    assert isinstance(data, MockDataModel)
    assert data.value == 42  # noqa: PLR2004


@pytest.mark.asyncio
async def test_recompute_updates_data(
    mock_materialized_view: MaterializedView,
) -> None:
    """Test that recompute updates the latest data."""
    await mock_materialized_view.recompute_latest_data()
    initial_data: MockDataModel = mock_materialized_view.get_latest_data()
    await mock_materialized_view.recompute_latest_data()
    new_data: MockDataModel = mock_materialized_view.get_latest_data()
    assert initial_data is not new_data  # Should be new instance
    assert initial_data.value == new_data.value  # But same value
