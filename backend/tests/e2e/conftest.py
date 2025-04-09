import pytest
from tacobi import Tacobi


@pytest.fixture
def appFactory(testSchema, testDecoratedDatasetFactory):
    """Create a FastAPI app with Tacobi."""

    def factory(return_value):
        tacobi = Tacobi()
        testDecoratedDatasetFactory(tacobi, testSchema, return_value)
        return tacobi

    return factory


@pytest.fixture
def clientFactory(appFactory):
    """Create a test client for the FastAPI app."""
    from fastapi.testclient import TestClient

    def factory(return_value):
        app = appFactory(return_value)
        return TestClient(app._fastapi_app)

    return factory
