"""Materialized views."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Generic

from tacobi.data_model.models import DataModelType
from tacobi.data_model.view_data import ViewDataModel
from tacobi.view.base import BaseView


@dataclass
class MaterializedView(BaseView, Generic[DataModelType]):
    """A materialized view."""

    function: Callable[[], Awaitable[DataModelType]]
    """The function to call to update the view."""

    _latest_data: DataModelType | None = None
    """The latest data from the view."""

    def __str__(self) -> str:
        """Get the string representation of the view."""
        return f"MaterializedView(name={self.name}, id={self.id})"

    def get_latest_data(self) -> DataModelType | None:
        """Get the latest data from the view."""
        return self._latest_data

    def get_latest_data_as_base_model(self) -> ViewDataModel:
        """Get the latest data from the view as a BaseModel."""
        return self.transform_to_base_model(self._latest_data)

    async def recompute_latest_data(self) -> None:
        """Recompute the latest data from the view."""
        self._latest_data = await self.function()

    def __hash__(self) -> int:
        """Hash the view."""
        return hash(self.id)

    def __eq__(self, other: object) -> bool:
        """Check if the view is equal to another object."""
        if not isinstance(other, MaterializedView):
            return False
        return self.id == other.id
