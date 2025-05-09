"""Materialized views."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Generic
from uuid import UUID, uuid4

from tacobi.data_model.models import DataModelType
from tacobi.view.base import BaseView


@dataclass
class MaterializedView(BaseView, Generic[DataModelType]):
    """A materialized view."""

    function: Callable[[], Awaitable[DataModelType]]
    """The function to call to update the view."""

    route: str | None = None
    """The optional REST route of the view."""

    name: str | None = None
    """The optional name of the view."""

    id: UUID = field(default_factory=uuid4)
    """The unique identifier for the view."""

    _latest_data: DataModelType | None = None
    """The latest data from the view."""

    def __str__(self) -> str:
        """Get the string representation of the view."""
        return f"MaterializedView(name={self.name}, id={self.id})"

    def get_latest_data(self) -> DataModelType | None:
        """Get the latest data from the view."""
        return self._latest_data

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
