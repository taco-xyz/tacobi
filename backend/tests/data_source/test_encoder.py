"""Tests for the encoder classes."""

import polars as pl
import pytest
from pydantic import BaseModel, ValidationError

from tacobi.streaming.data_source.encode import PolarsEncoder, PydanticEncoder


class TestData(BaseModel):
    """Test data model for PydanticEncoder tests."""

    name: str
    value: int


def test_pydantic_encoder() -> None:
    """Test PydanticEncoder encoding and decoding.

    - Creates a test data model
    - Encodes and decodes the test data model
    - Checks if the encoded and decoded data are the same
    """
    encoder = PydanticEncoder(base_model=TestData)
    value = 42
    test_data = TestData(name="test", value=value)

    # Test encoding
    encoded = encoder.encode(test_data)
    assert isinstance(encoded, bytes)

    # Test decoding
    decoded = encoder.decode(encoded)
    assert isinstance(decoded, TestData)
    assert decoded.name == "test"
    assert decoded.value == value


def test_polars_encoder() -> None:
    """Test PolarsEncoder encoding and decoding.

    - Creates a test data model
    - Encodes and decodes the test data model
    - Checks if the encoded and decoded data are the same
    """
    encoder = PolarsEncoder()

    # Create test data
    test_df = pl.LazyFrame({"a": [1, 2, 3], "b": ["x", "y", "z"]})

    # Test encoding
    encoded = encoder.encode(test_df)
    assert isinstance(encoded, bytes)

    # Test decoding
    decoded = encoder.decode(encoded)
    assert isinstance(decoded, pl.LazyFrame)

    # Compare data
    decoded_df = decoded.collect()
    original_df = test_df.collect()
    assert decoded_df.equals(original_df)


def test_pydantic_encoder_invalid_data() -> None:
    """Test PydanticEncoder with invalid data.

    - Attempts to decode invalid json
    - Checks if a ValidationError is raised
    """
    encoder = PydanticEncoder(base_model=TestData)

    with pytest.raises(ValidationError):
        encoder.decode(b"invalid json")


def test_polars_encoder_invalid_data() -> None:
    """Test PolarsEncoder with invalid data.

    - Attempts to decode invalid parquet data
    - Checks if a ComputeError is raised
    """
    encoder = PolarsEncoder()

    lazyframe = encoder.decode(b"invalid parquet data")
    assert isinstance(lazyframe, pl.LazyFrame)
    with pytest.raises(pl.exceptions.ComputeError):
        str(lazyframe.head())
