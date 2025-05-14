"""Test app."""

from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()


class TestSchema(BaseModel):
    name: str
    age: int


@app.get("/test")
async def test(
    name: str | None = Query(default=None), age: int | None = Query(default=None)
) -> TestSchema:
    return TestSchema(name=name, age=age)
