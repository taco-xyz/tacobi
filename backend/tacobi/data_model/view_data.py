"""Models for data models."""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any

from pandera.dtypes import DataType, is_numeric, is_string
from pandera.polars import DataFrameModel
from pydantic import BaseModel, Field, create_model


class ValueTypeEnum(str, Enum):
    """The type of a value in a column."""

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

    def into_python_type(self) -> type[Any]:
        """Convert a ValueTypeEnum to a Python type."""
        match self:
            case self.STRING:
                return str
            case self.NUMBER:
                return float
            case _:
                msg = f"Unsupported value type: {self}"
                raise ValueError(msg)


@dataclass
class TabularDatasetColumnSchema:
    """Individual column definition for a tabular dataset."""

    name: str
    """The name of the column."""

    value_type: ValueTypeEnum
    """The type of the values in the column."""


def _create_pydantic_model_from_dataframe(
    model: type[DataFrameModel],
) -> type[BaseModel]:
    """Create a Pydantic model from a DataFrameModel schema.

    ### Arguments:
    - model: The DataFrameModel class to convert.

    ### Returns:
    A dynamically created Pydantic model with the same fields.
    """
    schema = model.to_schema()
    fields: dict[str, tuple[type[Any], Any]] = {}
    for col_name, col in schema.columns.items():
        dtype: DataType = col.dtype
        col.description
        # Convert Pandera types to Python types
        python_type = ValueTypeEnum.from_pandera_dtype(col.dtype).into_python_type()
        # Add field with description if available
        field_kwargs = {}
        if col.description:
            field_kwargs["description"] = col.description
        if col.nullable:
            field_kwargs["default"] = None
            python_type = type(None) | python_type

        # Convert Pandera types to Python types that Pydantic understands
        if hasattr(python_type, "__name__") and python_type.__name__ == "String":
            python_type = str
        elif hasattr(python_type, "__name__") and python_type.__name__ == "Int64":
            python_type = int
        elif hasattr(python_type, "__name__") and python_type.__name__ == "Float64":
            python_type = float
        elif hasattr(python_type, "__name__") and python_type.__name__ == "Boolean":
            python_type = bool

        fields[col_name] = (python_type, Field(**field_kwargs))

    return create_model(f"{model.__name__}Response", **fields)


class TabularViewDataModel(BaseModel):
    """A base model for a tabular dataset."""

    column_schema: BaseModel
    """The schema of the columns of the dataset."""


ViewDataModel = BaseModel | TabularViewDataModel
"""A valid view data model can either be a Pydantic `BaseModel` or a
`TabularViewDataModel`, which itself contains a list of `BaseModel`s.
"""


class Dataset(BaseModel):
    """A base model for a dataset."""

    dataset_id: str
    """The ID of the dataset."""

    last_updated: datetime
    """The last updated date of the dataset."""

    data: ViewDataModel
    """The data of the dataset."""
