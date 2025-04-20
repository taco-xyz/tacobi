import pandas as pd
import pandera as pa
import pytest


def test_basic_endpoint(clientFactory):
    """Test that the basic endpoint returns the expected data."""
    client = clientFactory(pd.DataFrame({"column1": [1, 2, 3]}))
    response = client.get("/test")

    assert response.status_code == 200
    response_data = response.json()
    assert response_data == [{"column1": 1}, {"column1": 2}, {"column1": 3}]


def test_data_validation(clientFactory):
    """Test that the data validation works."""
    client = clientFactory(pd.DataFrame({"column1": [1, 2, "three"]}))

    with pytest.raises(pa.errors.SchemaError):
        client.get("/test")

    client = clientFactory(pd.DataFrame({"column2": [1, 2, 3]}))

    with pytest.raises(pa.errors.SchemaError):
        client.get("/test")
