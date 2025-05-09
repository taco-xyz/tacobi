"""Views."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any, Generic, TypeVar

from backend.tacobi.streaming.view.base import BaseView

from tacobi.streaming.data_model.models import DataModelType

T = TypeVar("T", bound=Any)


@dataclass
class View(BaseView, Generic[T, DataModelType]):
    """A standard view."""

    function: Callable[..., Awaitable[DataModelType]]
    """The function to call to update the view."""
