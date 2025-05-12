"""The main app class for TacoBI."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TypeVar

import rustworkx as rx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.base import BaseTrigger
from fastapi import FastAPI

from tacobi.data_model.models import DataModelType
from tacobi.view import BaseView, MaterializedView, View
from tacobi.view.dataset_schema import Schema

T = TypeVar("T", bound=Callable[[DataModelType], Awaitable[DataModelType]])


@dataclass
class ViewManager:
    """The main app class for TacoBI."""

    recompute_trigger: BaseTrigger
    """ The trigger that will be used to recompute the materialized views. """

    fastapi_app: FastAPI
    """ The FastAPI app that will be used to serve the views. """

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
        if view.route:
            self._attach_view_to_fastapi(view)

    def add_materialized_view(self, view: MaterializedView) -> None:
        """Add a materialized view to the app."""
        self._materialized_views.append(view)
        if view.route:
            self._attach_materialized_view_to_fastapi(view)

    def _get_sorted_views(self) -> list[BaseView]:
        """Get all views sorted by dependency order.

        ### Returns:
        List of views in order of calculation.
        """
        # Combine all views
        all_views = self._views + self._materialized_views

        # Create a directed graph
        graph = rx.PyDiGraph()

        # Add nodes and store mapping of UUID to node index
        node_map = {view.id: graph.add_node(view) for view in all_views}

        # Add edges for dependencies
        for view in all_views:
            if view.dependencies:
                for dep_view in view.dependencies:
                    graph.add_edge(node_map[dep_view], node_map[view.id], None)

        try:
            # Get topological sort
            sorted_indices = rx.topological_sort(graph)
            return [graph[node_idx] for node_idx in sorted_indices]
        except rx.DAGHasCycle as e:
            msg = "Circular dependency detected in views"
            raise ValueError(msg) from e

    async def _recompute_materialized_views(self) -> None:
        """Recompute all materialized views in dependency order."""
        materialized_views = [
            v for v in self._get_sorted_views() if isinstance(v, MaterializedView)
        ]

        print(f"Recomputing {len(materialized_views)} materialized views:")

        for i, view in enumerate(materialized_views):
            print(f"{i + 1}. Recomputing {view.name}...")
            await view.recompute_latest_data()

    # Lifecycle

    def start(self) -> None:
        """Start the recomputation of materialized views."""
        self._recompute_scheduler.add_job(
            self._recompute_materialized_views,
            trigger=self.recompute_trigger,
        )
        print("Starting scheduler")
        self._recompute_scheduler.start()

    def stop(self) -> None:
        """Stop the recomputation of materialized views."""
        self._recompute_scheduler.shutdown()

    # REST API

    def _attach_materialized_view_to_fastapi(
        self,
        view: MaterializedView,
    ) -> None:
        """Attach a materialized view to a FastAPI route.

        ### Arguments:
        - view: The materialized view to attach to the FastAPI route.
        """
        self.fastapi_app.get(view.route, response_model=view.fastapi_response_model)(
            view.get_latest_data
        )

    def _attach_view_to_fastapi(self, view: View) -> None:
        """Attach a view to a FastAPI route.

        ### Arguments:
        - view: The view to attach to the FastAPI route.
        """
        self.fastapi_app.get(view.route, response_model=view.fastapi_response_model)(
            view.function
        )

    # Schema

    @property
    def schema(self) -> Schema:
        """The schema of the exposed view endpoints."""
        all_views = self._views + self._materialized_views
        exposed_views = [v for v in all_views if v.route]
        return Schema(
            views=[v.schema for v in exposed_views],
        ).json_schema
