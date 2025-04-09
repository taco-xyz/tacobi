from typing import Callable, cast

import uvicorn
from fastapi import FastAPI
from pandera.typing.common import DataFrameBase

from tacobi.backend import pa
from tacobi.schema import Dataset, DatasetFunctionType, DatasetTypeEnum, Schema
from tacobi.type_utils import (
    extract_container_type,
    extract_model_from_typehints,
    extract_return_type,
)


class Tacobi:
    def __init__(self, fastapi_app: FastAPI | None = None):
        self._fastapi_app = fastapi_app if fastapi_app is not None else FastAPI()
        self._datasets: list[Dataset] = []

    def dataset(
        self, route: str, dataset_type: DatasetTypeEnum
    ) -> Callable[[DatasetFunctionType], DatasetFunctionType]:
        def decorator(func: DatasetFunctionType) -> DatasetFunctionType:
            type_checked_func = pa.check_types(func)
            type_checked_func = cast(DatasetFunctionType, type_checked_func)

            self._datasets.append(
                Dataset(
                    id=type_checked_func.__name__,
                    route=route,
                    type=dataset_type,
                    function=type_checked_func,
                )
            )

            return_type = extract_return_type(func)
            container_type = extract_container_type(return_type, DataFrameBase)
            model = extract_model_from_typehints(
                func, container_type, pa.DataFrameModel
            )

            class FastApiModel(model):  # type: ignore
                class Config(model.Config):  # type: ignore
                    to_format = "dict"
                    to_format_kwargs = {"orient": "records"}

            self._fastapi_app.get(route, response_model=container_type[FastApiModel])(
                type_checked_func
            )

            return type_checked_func

        return decorator

    def get_schema(self) -> Schema:
        return Schema(datasets=self._datasets)

    def run(self):
        uvicorn.run(self._fastapi_app, host="0.0.0.0", port=8000)
