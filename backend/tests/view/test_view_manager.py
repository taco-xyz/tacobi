"""Tests for the ViewManager class."""

from collections.abc import Awaitable, Callable

import pytest
from apscheduler.triggers.interval import IntervalTrigger
from pydantic import BaseModel

from tacobi.streaming.view import MaterializedView, View, ViewManager


class MockDataModel(BaseModel):
    """Mock data model for testing."""

    value: int


class MockDataModel2(BaseModel):
    """Mock data model for testing."""

    value: int
    derived_value: int


class MockDataModel3(BaseModel):
    """Mock data model for testing."""

    final_value: int


class State(BaseModel):
    """Mutable state for testing."""

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
    return View(function=mock_view_function, dependencies=[])


@pytest.fixture
def mock_materialized_view_function() -> Callable[[], Awaitable[MockDataModel]]:
    """Fixture providing a mock materialized view function."""

    async def _mock_function(prev_data: MockDataModel | None) -> MockDataModel:
        if prev_data is None:
            return MockDataModel(value=42)
        return MockDataModel(value=prev_data.value + 1)

    return _mock_function


@pytest.fixture
def mock_materialized_view(
    mock_materialized_view_function: Callable[
        [MockDataModel | None], Awaitable[MockDataModel]
    ],
) -> MaterializedView:
    """Fixture providing a mock materialized view."""
    return MaterializedView(function=mock_materialized_view_function, dependencies=[])


@pytest.fixture
def view_manager() -> ViewManager:
    """Fixture providing a ViewManager instance."""
    trigger = IntervalTrigger(seconds=1)
    return ViewManager(recompute_trigger=trigger)


def test_get_sorted_views_with_dependencies(
    view_manager: ViewManager,
    mock_view_function: Callable[[], Awaitable[MockDataModel]],
) -> None:
    """Test getting sorted views with dependencies."""
    view1 = View(name="view1", function=mock_view_function, dependencies=[])
    view2 = View(name="view2", function=mock_view_function, dependencies=[view1])
    view3 = View(name="view3", function=mock_view_function, dependencies=[view1])
    view4 = View(name="view4", function=mock_view_function, dependencies=[view2, view3])

    view_manager.add_view(view1)
    view_manager.add_view(view2)
    view_manager.add_view(view4)
    view_manager.add_view(view3)

    sorted_views = view_manager._get_sorted_views()
    assert len(sorted_views) == 4  # noqa: PLR2004

    for view in sorted_views:
        print(str(view))

    # Check that view1 is first
    assert sorted_views[0] == view1

    # Check that view2 and view3 are in the middle (order between them doesn't matter)
    assert sorted_views[1] in [view2, view3]
    assert sorted_views[2] in [view2, view3]
    assert view2 != view3
    assert sorted_views[1] != sorted_views[2]

    # Check that view4 is last
    assert sorted_views[3] == view4


def test_get_sorted_views_circular_dependency(
    view_manager: ViewManager,
    mock_view_function: Callable[[], Awaitable[MockDataModel]],
) -> None:
    """Test that circular dependencies are detected."""
    view1 = View(function=mock_view_function, dependencies=[])
    view2 = View(function=mock_view_function, dependencies=[view1])
    view1.dependencies = [view2]

    view_manager.add_view(view1)
    view_manager.add_view(view2)

    with pytest.raises(ValueError):  # noqa: PT011
        view_manager._get_sorted_views()


@pytest.mark.asyncio
async def test_recompute_materialized_views_chain(
    view_manager: ViewManager,
) -> None:
    """Test recomputing materialized views with dependencies."""
    # Create a mutable state
    state = State(value=42)

    async def mock_view1() -> MockDataModel:
        return MockDataModel(value=state.value)

    mv1 = MaterializedView(name="view1", function=mock_view1, dependencies=[])

    async def mock_view2() -> MockDataModel2:
        mv1_data = mv1.get_latest_data()
        return MockDataModel2(value=mv1_data.value, derived_value=mv1_data.value * 2)

    mv2 = MaterializedView(name="view2", function=mock_view2, dependencies=[mv1])

    async def mock_view3() -> MockDataModel3:
        mv2_data = mv2.get_latest_data()
        return MockDataModel3(final_value=mv2_data.derived_value + 10)

    # Create the views
    v3 = View(name="view3", function=mock_view3, dependencies=[mv2])

    # Add views to manager
    view_manager.add_materialized_view(mv1)
    view_manager.add_materialized_view(mv2)
    view_manager.add_view(v3)

    # First recompute
    await view_manager._recompute_materialized_views()

    # Check initial values
    assert mv1.get_latest_data().value == 42  # noqa: PLR2004
    assert mv2.get_latest_data().value == 42  # noqa: PLR2004
    assert mv2.get_latest_data().derived_value == 84  # noqa: PLR2004
    result = await v3.function()
    assert result.final_value == 94  # noqa: PLR2004

    # Change the base value
    state.value = 100

    # Second recompute
    await view_manager._recompute_materialized_views()

    # Check updated values
    assert mv1.get_latest_data().value == 100  # noqa: PLR2004
    assert mv2.get_latest_data().value == 100  # noqa: PLR2004
    assert mv2.get_latest_data().derived_value == 200  # noqa: PLR2004
    result = await v3.function()
    assert result.final_value == 210  # noqa: PLR2004


@pytest.mark.asyncio
async def test_start(view_manager: ViewManager) -> None:
    """Test starting the view manager."""
    view_manager.start()
    assert view_manager._recompute_scheduler.running
