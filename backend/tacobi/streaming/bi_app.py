"""The main app class for TacoBI."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TypeVar
from uuid import UUID

from apscheduler.triggers.base import BaseTrigger

from tacobi.streaming.data_model.models import DataModelType
from tacobi.streaming.data_source import CachedDataSource, DataSourceManager
from tacobi.streaming.view import MaterializedView, View, ViewManager

T = TypeVar("T", bound=Callable[[DataModelType], Awaitable[DataModelType]])


@dataclass
class TacoBIApp:
    """The main app class for TacoBI."""

    _data_source_manager: DataSourceManager = field(default_factory=DataSourceManager)
    """ Manager used for scheduling data sources."""

    _view_manager: ViewManager = field(default_factory=ViewManager)
    """ Manager used for scheduling views."""

    _view_function_ids: dict[Callable, UUID] = field(default_factory=dict)
    """ A dictionary of view functions. """

    # Data Source Management

    def data_source(
        self,
        name: str,
        trigger: BaseTrigger,
    ) -> Callable[
        [Callable[[DataModelType | None], Awaitable[DataModelType]]],
        Callable[[], DataModelType | None],
    ]:
        """Register a data source.

        Also transforms the function into a synchronous getter of the latest data.

        ### Arguments:
        - name: The name of the data source.
        - trigger: The trigger that will be used to schedule the data source.

        ### Returns:
        A function that returns the latest data from the data source.
        """

        def wrapper(
            func: Callable[[DataModelType | None], Awaitable[DataModelType]],
        ) -> Callable[[], DataModelType | None]:
            data_source = CachedDataSource(name=name, function=func, trigger=trigger)
            self._data_source_manager.add_data_source(data_source)

            return data_source.get_latest_data

        return wrapper

    # View Management

    def view(
        self,
        route: str | None = None,
        dependencies: list[Callable] | None = None,
    ) -> Callable[[T], T]:
        """Register a view.

        ### Arguments:
        - route: The route of the view.
        - dependencies: The dependencies of the view.

        ### Returns:
        The view function itself.
        """

        def wrapper(
            func: Callable[[T], Awaitable[DataModelType]],
        ) -> Callable[[T], Awaitable[DataModelType]]:
            # Get the dependencies
            dep_ids = (
                [self._view_function_ids[dep] for dep in dependencies]
                if dependencies
                else []
            )

            # Add the view to the view manager
            view = View(
                function=func,
                route=route,
                dependencies=dep_ids,
            )
            self._view_manager.add_view(view)

            # Register the view function in the view manager
            self._view_function_ids[func] = view.id
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
        """Register a materialized view.

        Also transforms the function into a synchronous getter of the latest data.

        ### Arguments:
        - route: The route of the view.
        - dependencies: The dependencies of the view.

        ### Returns:
        The view function itself.
        """

        def wrapper(
            func: Callable[[DataModelType | None], Awaitable[DataModelType]],
        ) -> Callable[[], DataModelType | None]:
            # Get the dependencies
            dep_ids = (
                [self._view_function_ids[dep] for dep in dependencies]
                if dependencies
                else []
            )

            # Add the view to the view manager
            view = MaterializedView(
                function=func,
                route=route,
                dependencies=dep_ids,
            )
            self._view_manager.add_materialized_view(view)

            # Register the view function in the view manager
            self._view_function_ids[func] = view.id

            # Return the latest data from the view
            def get_latest_view_data() -> DataModelType | None:
                return view.get_latest_data()

            return get_latest_view_data

        return wrapper

    # Lifecycle

    async def start(self) -> None:
        """Start the recomputation of datasets and materialized views."""
        await self._data_source_manager.start()
        self._view_manager.start()
