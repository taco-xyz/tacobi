"""Base view class."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from functools import cached_property
from typing import ClassVar, Generic
from uuid import UUID, uuid4

from pandera import DataFrameModel
from pandera.typing import DataFrame
from pydantic import BaseModel

from tacobi.data_model.models import DataModelType
from tacobi.view.dataset_schema import (
    ViewEndpointSchema,
    create_column_base_model_from_dataframe_model,
)
from tacobi.view.type_utils import (
    extract_container_type,
    extract_model_from_typehints,
    extract_return_type,
)


@dataclass
class BaseView(Generic[DataModelType]):
    """Base view class."""

    function: Callable[..., Awaitable[DataModelType]]
    """The function to call to update the view."""

    dependencies: list[UUID] = field(default_factory=list)
    """The dependencies of the view used for topological sorting."""

    route: str | None = None
    """The optional REST route of the view."""

    name: str | None = None
    """The optional name of the view for logging and debugging."""

    id: UUID = field(default_factory=uuid4)
    """The unique identifier for the view."""

    def __str__(self) -> str:
        """Get the string representation of the view."""
        return f"View(name={self.name}, id={self.id})"

    def __hash__(self) -> int:
        """Hash the view."""
        return hash(self.id)

    @cached_property
    def return_type(self) -> type[DataModelType]:
        """The return type of the view."""
        return extract_return_type(self.function)

    @cached_property
    def input_type(self) -> type[BaseModel] | None:
        """The input parameter of the view."""
        input_params = list(self.function.__annotations__.items())[1:]

        if len(input_params) == 0:
            return None

        if len(input_params) > 1:
            msg = f"""View must have exactly one input parameter. Input params:
            {input_params}"""
            raise ValueError(msg)

        _, param_type = input_params[0]

        if not issubclass(param_type, BaseModel):
            msg = f"""Input parameter must be a Pydantic BaseModel. Input param:
            {param_type}"""
            raise TypeError(msg)

        return param_type

    @cached_property
    def fastapi_response_model(self) -> type[BaseModel]:
        """The response model for the view."""
        return_type = self.return_type

        # If the return type is a BaseModel, we just return it as is
        if issubclass(return_type, BaseModel):
            return return_type

        # Return a FastAPI model configured for converting to a dict
        # Read more here: https://pandera.readthedocs.io/en/latest/fastapi.html

        container_type = extract_container_type(return_type, DataFrame)
        model = extract_model_from_typehints(
            self.function, container_type, DataFrameModel
        )

        class FastAPIModel(model):
            class Config:
                to_format: ClassVar[str] = "dict"
                to_format_kwargs: ClassVar[dict[str, str]] = {"orient": "records"}

        return container_type[FastAPIModel]

    @cached_property
    def output_schema(self) -> type[BaseModel]:
        """The output schema of the view."""
        return_type = self.return_type

        if issubclass(return_type, BaseModel):
            return return_type

        container_type = extract_container_type(return_type, DataFrame)
        model = extract_model_from_typehints(
            self.function, container_type, DataFrameModel
        )

        return create_column_base_model_from_dataframe_model(model)

    @cached_property
    def schema(self) -> ViewEndpointSchema:
        """The schema of the view."""
        input_schema = self.input_type
        data_schema = self.output_schema

        return ViewEndpointSchema(
            route=self.route,
            input_schema=input_schema,
            data_schema=data_schema,
        )
