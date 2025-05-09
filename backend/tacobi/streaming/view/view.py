"""Views."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Generic
from uuid import UUID, uuid4

from tacobi.streaming.data_model.models import DataModelType
from tacobi.streaming.view.base import BaseView


@dataclass
class View(BaseView, Generic[DataModelType]):
    """A standard view."""

    function: Callable[..., Awaitable[DataModelType]]
    """The function to call to update the view."""

    name: str | None = None
    """The optional name of the view."""

    _id: UUID = field(default_factory=uuid4)
    """The unique identifier for the view."""

    def __str__(self) -> str:
        """Get the string representation of the view."""
        return f"View(name={self.name}, id={self._id})"

    def __hash__(self) -> int:
        """Hash the view."""
        return hash(self._id)

    def __eq__(self, other: object) -> bool:
        """Check if the view is equal to another object."""
        if not isinstance(other, View):
            return False
        return self._id == other._id
