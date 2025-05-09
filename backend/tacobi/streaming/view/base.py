"""Base view class."""

from dataclasses import dataclass


@dataclass
class BaseView:
    """Base view class."""

    dependencies: list["BaseView"]
    """The dependencies of the view used for topological sorting."""
