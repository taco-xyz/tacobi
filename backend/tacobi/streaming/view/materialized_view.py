"""Materialized views."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from tacobi.streaming.data_model.models import DataModelType
from tacobi.streaming.view.base import BaseView


@dataclass
class MaterializedView(BaseView):
    """A materialized view."""

    function: Callable[[], Awaitable[DataModelType]]
    """The function to call to update the view."""

    _latest_data: DataModelType | None = None
    """The latest data from the view."""

    def get_latest_data(self) -> DataModelType | None:
        """Get the latest data from the view."""
        return self._latest_data

    async def recompute_latest_data(self) -> None:
        """Recompute the latest data from the view."""
        self._latest_data = await self.function()
