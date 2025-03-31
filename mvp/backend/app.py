from pydantic import BaseModel
import polars as pl
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ValidValue = int | float | str
""" Valid values for ECharts. """


class TacoBIResponse(BaseModel):
    """
    Generic response for a TacoBI data endpoint.
    """

    headers: list[str]
    """ CSV headers. """

    values: list[list[ValidValue]]
    """ CSV values (list of rows). """


@app.get("/drinks")
async def get_drinks():
    data = pl.read_csv("data.csv")
    values = data.to_numpy().tolist()
    return TacoBIResponse(headers=data.columns, values=values)
