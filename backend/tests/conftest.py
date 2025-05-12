"""Fixtures for tests."""

import pytest
from fastapi import FastAPI


@pytest.fixture
def fastapi_app() -> FastAPI:
    """Fixture providing a FastAPI app."""
    return FastAPI()
