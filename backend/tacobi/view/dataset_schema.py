"""Dataset schema classes."""

from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Literal, TypeVar

from pandera import Column, DataFrameModel
from pandera.dtypes import DataType, is_numeric, is_string
from pandera.typing.common import DataFrameBase
from pydantic import BaseModel, Field, create_model

DataFrameBaseT = TypeVar("DataFrameBaseT", bound=DataFrameBase)
DatasetFunctionType = Callable[[], DataFrameBaseT]


class DatasetTypeEnum(str, Enum):
    """The type of a dataset."""

    TABULAR = "tabular"
    OBJECT = "object"


class ViewTypeEnum(str, Enum):
    """The type of a view."""

    MATERIALIZED = "materialized"
    NORMAL = "normal"


class ValueTypeEnum(str, Enum):
    """The type of a value in a column. Used for fabricating Pydantic models."""

    STRING = "string"
    NUMBER = "number"

    @classmethod
    def from_pandera_dtype(cls, dtype: DataType) -> "ValueTypeEnum":
        """Convert a pandera dtype to a ValueTypeEnum."""
        if is_numeric(dtype):
            return cls.NUMBER
        if is_string(dtype):
            return cls.STRING
        msg = f"Unsupported dtype: {dtype}"
        raise ValueError(msg)

    def into_python_type(self) -> type[str] | type[float]:
        """Convert a ValueTypeEnum to a Python type."""
        match self:
            case self.STRING:
                return str
            case self.NUMBER:
                return float
            case _:
                msg = f"Unsupported value type: {self}"
                raise ValueError(msg)


def create_column_base_model_from_dataframe_model(
    dataframe_model: type[DataFrameModel],
) -> type[BaseModel]:
    """Create a BaseModel from a DataFrameModel.

    ### Arguments:
    - dataframe_model: The DataFrameModel to create a BaseModel from.

    ### Returns:
    The BaseModel class.
    """
    schema_columns: Iterable[Column] = dataframe_model.to_schema().columns.values()
    fields: dict[str, tuple[type[Any], Any]] = {}
    for col in schema_columns:
        python_type = ValueTypeEnum.from_pandera_dtype(col.dtype).into_python_type()
        fields[col.name] = (python_type, Field(description=col.description))

    return create_model(f"{dataframe_model.__name__}Response", **fields)


class ViewEndpointResponseModel(BaseModel):
    """The return object of a view endpoint."""

    last_updated: datetime
    """The last updated date of the view."""

    view_type: ViewTypeEnum
    """The type of the view. Can be either `MATERIALIZED` or `NORMAL`."""

    data_type: DatasetTypeEnum
    """The type of the data. Can be either `TABULAR` or `OBJECT`."""

    data: BaseModel
    """The data of the view. Always a Pydantic `BaseModel`."""


@dataclass
class ViewEndpointSchema:
    """The schema of a view endpoint. Used for code gen on the frontend."""

    route: str
    """The route of the view endpoint."""

    data_schema: type[BaseModel]
    """The schema of the data. Always a Pydantic `BaseModel`."""

    input_schema: type[BaseModel] | None = None
    """The schema of the input parameters. Always a Pydantic `BaseModel`.
    If the the view is materialized, this is always `None`.
    """

    @property
    def json_schema(self) -> dict[str, Any]:
        """The JSON schema of the data."""
        return {
            "route": self.route,
            "data_schema": self.data_schema.model_json_schema(),
            "input_schema": self.input_schema.model_json_schema()
            if self.input_schema
            else None,
        }


@dataclass
class Schema:
    """The schema of a view."""

    views: list[ViewEndpointSchema]
    """The views in the schema."""

    @property
    def json_schema(self) -> dict[str, Any]:
        """The JSON schema of the schema."""
        return {
            "views": [view.json_schema for view in self.views],
        }
