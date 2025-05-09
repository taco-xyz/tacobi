"""The main app class for TacoBI."""

from collections import defaultdict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TypeVar

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.base import BaseTrigger

from tacobi.streaming.data_model.models import DataModelType
from tacobi.streaming.view import BaseView, MaterializedView, View

T = TypeVar("T", bound=Callable[[DataModelType], Awaitable[DataModelType]])


@dataclass
class ViewManager:
    """The main app class for TacoBI."""

    recompute_trigger: BaseTrigger
    """ The trigger that will be used to recompute the materialized views. """

    _recompute_scheduler: AsyncIOScheduler = field(default_factory=AsyncIOScheduler)
    """ The scheduler that will be used to recompute the materialized views. """

    _views: list[View] = field(default_factory=list)
    """ The views that are used in the app. """

    _materialized_views: list[MaterializedView] = field(default_factory=list)
    """ The materialized views that are used in the app. """

    # View Management

    def add_view(self, view: View) -> None:
        """Add a view to the app."""
        self._views.append(view)

    def add_materialized_view(self, view: MaterializedView) -> None:
        """Add a materialized view to the app."""
        self._materialized_views.append(view)

    def _get_sorted_views(self) -> list[BaseView]:
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

    async def _recompute_materialized_views(self) -> None:
        """Recompute all materialized views in dependency order."""
        materialized_views = [
            v for v in self._get_sorted_views() if isinstance(v, MaterializedView)
        ]

        for view in materialized_views:
            await view.recompute_latest_data()

    # Lifecycle

    def start(self) -> None:
        """Start the recomputation of materialized views."""
        self._recompute_scheduler.add_job(
            self._recompute_materialized_views,
            trigger=self.recompute_trigger,
        )
        self._recompute_scheduler.start()
