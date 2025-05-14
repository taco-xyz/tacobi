"""Test the conversion of a DataFrameModel to a BaseModel."""

from datetime import UTC, datetime

from pandera.polars import DataFrameModel

from tacobi.view.view_models.endpoint_model import (
    ViewEndpointResponseModel,
    create_column_base_model_from_dataframe_model,
)


class TestDataFrame(DataFrameModel):
    """Test DataFrame model for testing conversion."""

    id: int
    name: str
    age: int
    score: float


def test_create_column_base_model_from_dataframe_model() -> None:
    """Test creating BaseModel from DataFrameModel."""
    # =====================================================
    # Test model creation
    # =====================================================

    result_model = create_column_base_model_from_dataframe_model(TestDataFrame)

    assert result_model.__name__ == "TestDataFrameModel"

    # Check fields exist
    fields = result_model.model_fields
    assert "id" in fields
    assert "name" in fields
    assert "age" in fields
    assert "score" in fields

    # Check field types
    assert fields["id"].annotation is float
    assert fields["name"].annotation is str
    assert fields["age"].annotation is float
    assert fields["score"].annotation is float

    # =====================================================
    # Test instantiation
    # =====================================================

    age = 30
    score = 95.5
    model_id = 1
    name = "John"

    instance = result_model(id=model_id, name=name, age=age, score=score)
    assert instance.id == model_id
    assert instance.name == name
    assert instance.age == age
    assert instance.score == score


def test_create_column_base_model_empty_dataframe() -> None:
    """Test with empty DataFrameModel."""

    class EmptyDataFrameModel(DataFrameModel):
        pass

    result_model = create_column_base_model_from_dataframe_model(EmptyDataFrameModel)
    assert len(result_model.model_fields) == 0


def test_view_endpoint_response_model_creation() -> None:
    """Test creating a response model from a base model."""
    # =====================================================
    # Test model creation
    # =====================================================

    result_model_class = create_column_base_model_from_dataframe_model(TestDataFrame)
    response_model = ViewEndpointResponseModel.create_class_from_model(
        result_model_class
    )

    assert response_model.__name__ == "TestDataFrameModelResponse"

    # Check fields exist
    fields = response_model.model_fields
    assert "last_updated" in fields
    assert "data" in fields

    # =====================================================
    # Test instantiation
    # =====================================================

    _id = 1
    name = "John"
    age = 30
    score = 95.5

    data_instance = result_model_class(id=_id, name=name, age=age, score=score)
    response_instance = response_model(
        last_updated=datetime.now(UTC), data=data_instance
    )

    assert response_instance.data.id == _id
    assert response_instance.data.name == name
    assert response_instance.data.age == age
    assert response_instance.data.score == score
    assert isinstance(response_instance.last_updated, datetime)


def test_view_endpoint_response_model_list() -> None:
    """Test creating a response model from a list of base models."""
    result_model_class = create_column_base_model_from_dataframe_model(TestDataFrame)

    list_model = list[result_model_class]
    response_model = ViewEndpointResponseModel.create_class_from_model(list_model)

    # Check model name includes list indicator
    assert "List" in response_model.__name__

    # Test instantiation

    _id1 = 1
    _name1 = "John"
    _age1 = 30
    _score1 = 95.5

    _id2 = 2
    _name2 = "Jane"
    _age2 = 25
    _score2 = 88.0

    data_instances = [
        result_model_class(id=_id1, name=_name1, age=_age1, score=_score1),
        result_model_class(id=_id2, name=_name2, age=_age2, score=_score2),
    ]
    response_instance = response_model(
        last_updated=datetime.now(UTC), data=data_instances
    )

    assert len(response_instance.data) == 2  # noqa: PLR2004
    assert response_instance.data[0].name == _name1
    assert response_instance.data[1].name == _name2
