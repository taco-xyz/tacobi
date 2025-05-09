"""Base view class."""

from dataclasses import dataclass
from uuid import UUID


@dataclass
class BaseView:
    """Base view class."""

    dependencies: list[UUID]
    """The dependencies of the view used for topological sorting."""
