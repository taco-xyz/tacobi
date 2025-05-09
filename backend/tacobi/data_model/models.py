"""Models for data models."""

from typing import TypeVar

from polars import LazyFrame
from pydantic import BaseModel

DataModel = LazyFrame | BaseModel
"""A valid data model can either be a Polars `LazyFrame` or a Pydantic
`BaseModel`. Views and data sources can return either of these types.
"""

DataModelType = TypeVar("DataModelType", bound=DataModel)
"""A type variable for the data model type."""
