"""The main app class for TacoBI."""

from collections import defaultdict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TypeVar

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.base import BaseTrigger
from fastapi import FastAPI

from tacobi.streaming.data_model.models import DataModelType
from tacobi.streaming.data_source import CachedDataSource, DataSourceScheduler
from tacobi.streaming.view import BaseView, MaterializedView, View

T = TypeVar("T", bound=Callable[[DataModelType], Awaitable[DataModelType]])


@dataclass
class TacoBIApp:
    """The main app class for TacoBI."""

    recompute_trigger: BaseTrigger
    """ The trigger that will be used to recompute the materialized views. """

    fast_api: FastAPI = field(default_factory=FastAPI)
    """ The FastAPI app that will be used to expose the API. """

    _recompute_scheduler: AsyncIOScheduler = field(default_factory=AsyncIOScheduler)
    """ The scheduler that will be used to recompute the materialized views. """

    _data_source_scheduler: DataSourceScheduler = field(
        default_factory=DataSourceScheduler
    )
    """ Scheduler used for recomputing data sources."""

    _views: list[View] = field(default_factory=list)
    """ The views that are used in the app. """

    _materialized_views: list[MaterializedView] = field(default_factory=list)
    """ The materialized views that are used in the app. """

    # Data Source Management

    def add_data_source(
        self,
        name: str,
        function: Callable[[DataModelType | None], Awaitable[DataModelType]],
        trigger: BaseTrigger,
    ) -> CachedDataSource[DataModelType]:
        """Add a data source to the app.

        ### Arguments:
        - name: The name of the data source.
        - function: The function that will be called to update the data source.
        - trigger: The trigger that will be used to schedule the data source.

        ### Returns:
        - The data source that was added to the app.
        """
        data_source = CachedDataSource(name=name, function=function, trigger=trigger)
        self._data_source_scheduler.add_data_source(data_source)
        return data_source

    def data_source(
        self,
        name: str,
        trigger: BaseTrigger,
    ) -> Callable[
        [Callable[[DataModelType | None], Awaitable[DataModelType]]],
        Callable[[], DataModelType | None],
    ]:
        """Add a data source to the app."""

        def wrapper(
            func: Callable[[DataModelType | None], Awaitable[DataModelType]],
        ) -> Callable[[], DataModelType | None]:
            return self.add_data_source(name, func, trigger).get_latest_data

        return wrapper

    # Lifecycle

    async def start(self) -> None:
        """Start the recomputation of datasets and materialized views."""
        await self._data_source_scheduler.restore_cache()
        self._data_source_scheduler.start()
        self._recompute_scheduler.add_job(
            self.recompute_materialized_views,
            trigger=self.recompute_trigger,
        )
        self._recompute_scheduler.start()

    # View Management

    def view(
        self,
        route: str | None = None,
        dependencies: list[Callable] | None = None,
    ) -> Callable[[T], T]:
        """Add a view to the app.

        If you wish for the view to be exposed via REST API, you can pass a route.
        """

        def wrapper(
            func: Callable[[T], Awaitable[DataModelType]],
        ) -> Callable[[T], Awaitable[DataModelType]]:
            view = View(
                function=func,
                route=route,
                dependencies=dependencies,
            )
            self._views.append(view)
            return func

        return wrapper

    def materialized_view(
        self,
        route: str | None = None,
        dependencies: list[Callable] | None = None,
    ) -> Callable[
        [Callable[[DataModelType | None], Awaitable[DataModelType]]],
        Callable[[], DataModelType | None],
    ]:
        """Add a materialized view to the app.

        If you wish for the view to be exposed via REST API, you can pass a route.
        """

        def wrapper(
            func: Callable[[DataModelType | None], Awaitable[DataModelType]],
        ) -> Callable[[], DataModelType | None]:
            view = MaterializedView(
                function=func,
                route=route,
                dependencies=dependencies,
            )
            self._materialized_views.append(view)

            def get_latest_view_data() -> DataModelType | None:
                return view.get_latest_data()

            return get_latest_view_data

        return wrapper

    def get_sorted_views(self) -> list[BaseView]:
        """Get all views sorted by dependency order.

        ### Returns:
        List of views in order of calculation.
        """
        # Combine all views
        all_views = self._views + self._materialized_views

        # Build dependency graph
        graph: dict[BaseView, set[BaseView]] = defaultdict(set)
        in_degree: dict[BaseView, int] = defaultdict(int)

        # Map function to view for dependency lookup
        func_to_view = {v.function: v for v in all_views}

        # Build graph and count dependencies
        for view in all_views:
            if view.dependencies:
                for dep_func in view.dependencies:
                    if dep_func in func_to_view:
                        dep_view = func_to_view[dep_func]
                        graph[dep_view].add(view)
                        in_degree[view] += 1

        # Topological sort using Kahn's algorithm
        result = []
        queue = [v for v in all_views if in_degree[v] == 0]

        while queue:
            view = queue.pop(0)
            result.append(view)

            for dependent in graph[view]:
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)

        # Check for cycles
        if len(result) != len(all_views):
            msg = "Circular dependency detected in views"
            raise ValueError(msg)

        return result

    async def recompute_materialized_views(self) -> None:
        """Recompute all materialized views in dependency order."""
        materialized_views = [
            v for v in self.get_sorted_views() if isinstance(v, MaterializedView)
        ]

        for view in materialized_views:
            await view.recompute_latest_data()


if __name__ == "__main__":
    import polars as pl
    from apscheduler.triggers.cron import CronTrigger

    TEST_APP = TacoBIApp()

    @TEST_APP.data_source(
        name="test_source_1",
        trigger=CronTrigger.from_crontab("*/1 * * * *"),
    )
    async def test_data_source(df: pl.LazyFrame) -> pl.LazyFrame:
        """Test data source."""
        return df

    latest_data = test_data_source()

    @TEST_APP.view()
    async def test_view(df: pl.LazyFrame) -> pl.LazyFrame:
        """Test view."""
        return df

    # Prints the type of the test_view
    print(type(test_view))

    async def test():
        result = await test_view(pl.LazyFrame({"a": [1, 2, 3]}))
        print(result)

    from pydantic import BaseModel

    class TestClass(BaseModel):
        a: int

    @TEST_APP.materialized_view(dependencies=[test_view])
    async def test_materialized_view(
        previous_data: TestClass | None,
    ) -> TestClass:
        """Test materialized view."""
        return await test_view(previous_data)

    result = test_materialized_view()

    TEST_APP.start()
