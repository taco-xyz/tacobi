"""Models for data sources."""

import io
from abc import ABC, abstractmethod
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Generic, TypeVar

import polars as pl
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.base import BaseTrigger
from pydantic import BaseModel

from tacobi.streaming.data_model.models import DataModelType
from tacobi.streaming.data_source.cache import (
    CacheBackend,
    EncodedDataType,
    SQLiteCache,
)

# Encoding


class Encoder(ABC):
    """An encoder that can encode and decode data."""

    @abstractmethod
    def encode(self, data: DataModelType) -> EncodedDataType:
        """Encode the data."""
        ...

    @abstractmethod
    def decode(self, data: EncodedDataType) -> DataModelType:
        """Decode the data."""
        ...


BaseModelType = TypeVar("BaseModelType", bound=BaseModel)


@dataclass
class PydanticEncoder(Encoder):
    """An encoder that can encode and decode Pydantic models."""

    base_model: BaseModelType
    """ The base model that is used to encode and decode the data. """

    def encode(self, data: DataModelType) -> EncodedDataType:
        """Encode the data."""
        return data.model_dump_json().encode("utf-8")

    def decode(self, data: EncodedDataType) -> DataModelType:
        """Decode the data."""
        return self.base_model.model_validate_json(data.decode("utf-8"))


@dataclass
class PolarsEncoder(Encoder):
    """An encoder that can encode and decode Polars data."""

    def encode(self, data: pl.LazyFrame) -> EncodedDataType:
        """Encode the data."""
        buffer = io.BytesIO()
        data.sink_parquet(buffer)
        return buffer.getvalue()

    def decode(self, data: EncodedDataType) -> pl.LazyFrame:
        """Decode the data."""
        return pl.scan_parquet(io.BytesIO(data))


# Data Source


@dataclass
class CachedDataSource(Generic[DataModelType]):
    """A data source that is locally stored and can be instantly queried."""

    name: str
    """ The *UNIQUE* name of the data source. """

    function: Callable[[DataModelType | None], Awaitable[DataModelType]]
    """ The function that is used to update the data. """

    trigger: BaseTrigger
    """ The cron trigger that is used to update the data source. """

    _encoder: Encoder | None = None
    """ The encoder that is used to encode and decode the data. """

    _cached_data: DataModelType | None = None
    """ Latest cached data, None if no data has been cached yet. """

    def __post_init__(self) -> None:
        """Based on the type hints for the function, determine the encoder."""
        if self.function.__annotations__["return"] == pl.LazyFrame:
            self._encoder = PolarsEncoder()
        elif self.function.__annotations__["return"] == BaseModel:
            self._encoder = PydanticEncoder(
                base_model=self.function.__annotations__["return"]
            )

    async def update(self, cache_backend: CacheBackend) -> None:
        """Call the fetch function and update the cache accordingly."""
        self._cached_data = await self.function(self._cached_data)
        await cache_backend.set(
            key=self.name, value=self._encoder.encode(self._cached_data)
        )

    async def load(self, cache_backend: CacheBackend) -> None:
        """Load the data from the cache backend."""
        self._cached_data = await cache_backend.get(key=self.name)

    def get_latest_data(self) -> DataModelType | None:
        """Get the latest data from the data source."""
        data = self._cached_data
        return self._encoder.decode(data) if data else None


# Scheduler


@dataclass
class DataSourceScheduler:
    """A scheduler that can schedule tasks to be executed at a specific time."""

    _data_sources: list[CachedDataSource] = field(default_factory=list)
    """ The data sources that are scheduled to be updated. """

    _scheduler: AsyncIOScheduler = field(default_factory=AsyncIOScheduler)
    """ The scheduler that is used to schedule the tasks. """

    _cache_backend: CacheBackend = field(default_factory=SQLiteCache)
    """ The cache backend that is used to store the data. """

    def _schedule_data_source(self, data_source: CachedDataSource) -> None:
        """Schedule a data source to be updated according to its trigger.

        ### Arguments
        - data_source: The data source to schedule.
        """

        async def update_job() -> None:
            await data_source.update(self._cache_backend)

        self._scheduler.add_job(
            update_job,
            trigger=data_source.trigger,
            id=f"update_{data_source.name}",
            replace_existing=True,
        )

    async def restore_cache(self) -> None:
        """Restore the cache from the cache backend."""
        for data_source in self._data_sources:
            await data_source.load(self._cache_backend)

    def add_data_source(self, data_source: CachedDataSource) -> None:
        """Add a data source to the scheduler."""
        self._data_sources.append(data_source)
        self._schedule_data_source(data_source)

    def start(self) -> None:
        """Start the scheduler."""
        self._scheduler.start()
