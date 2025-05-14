"""The main app class for TacoBI."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TypeVar
from uuid import UUID

from apscheduler.triggers.base import BaseTrigger

from tacobi.data_model.models import DataModelType
from tacobi.data_source import CachedDataSource, DataSourceManager
from tacobi.view import MaterializedView, View, ViewManager

T = TypeVar("T", bound=Callable[[DataModelType], Awaitable[DataModelType]])


@dataclass
class TacoBIApp:
    """The main app class for TacoBI."""

    view_manager: ViewManager
    """ Manager used for scheduling views."""

    data_source_manager: DataSourceManager = field(default_factory=DataSourceManager)
    """ Manager used for scheduling data sources."""

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
            self.data_source_manager.add_data_source(data_source)

            return data_source.get_latest_data

        return wrapper

    # View Management

    def view(
        self,
        name: str,
        route: str | None = None,
        dependencies: list[Callable] | None = None,
    ) -> Callable[[T], T]:
        """Register a view.

        ### Arguments:
        - name: The name of the view.
        - route: The route of the view.
        - dependencies: The dependencies of the view.

        ### Returns:
        The view function itself.
        """

        def wrapper(
            func: Callable[[T], Awaitable[DataModelType]],
        ) -> Callable[[T], Awaitable[DataModelType]]:
            # Get the dependencies
            try:
                dep_ids = (
                    [self._view_function_ids[dep] for dep in dependencies]
                    if dependencies
                    else []
                )
            except KeyError as e:
                msg = f"Dependency {e} not found"
                raise ValueError(msg) from e

            # Add the view to the view manager
            view = View(
                name=name,
                function=func,
                route=route,
                dependencies=dep_ids,
            )
            self.view_manager.add_view(view)

            # Register the view function in the view manager
            self._view_function_ids[func] = view.id
            return func

        return wrapper

    def materialized_view(
        self,
        name: str,
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
            try:
                dep_ids = (
                    [self._view_function_ids[dep] for dep in dependencies]
                    if dependencies
                    else []
                )
            except KeyError as e:
                msg = f"Dependency {e} not found"
                raise ValueError(msg) from e

            # Add the view to the view manager
            view = MaterializedView(
                name=name,
                function=func,
                route=route,
                dependencies=dep_ids,
            )
            self.view_manager.add_materialized_view(view)

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
        await self.data_source_manager.start()
        await self.view_manager.start()

    async def stop(self) -> None:
        """Stop the recomputation of datasets and materialized views."""
        await self.data_source_manager.stop()
        await self.view_manager.stop()
