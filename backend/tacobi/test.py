from tacobi.streaming.bi_app import TacoBIApp

if __name__ == "__main__":
    import polars as pl
    from apscheduler.triggers.cron import CronTrigger
    import asyncio

    TEST_APP = TacoBIApp()

    async def test_data_source(df: pl.DataFrame) -> pl.DataFrame:
        """Test data source."""
        return df

    TEST_SOURCE_1 = TEST_APP.add_data_source(
        name="test_source_1",
        function=test_data_source,
        trigger=CronTrigger.from_crontab("*/1 * * * *"),
    )

    latest_data = TEST_SOURCE_1.get_latest_data()

    @TEST_APP.view()
    async def test_view(df: pl.DataFrame) -> pl.DataFrame:
        """Test view."""
        return df

    # Prints the type of the test_view
    print(type(test_view))
    asyncio.run(test_view())

    @TEST_APP.materialized_view(dependencies=[test_view])
    async def test_materialized_view(df: pl.DataFrame) -> pl.DataFrame:
        """Test materialized view."""
        return test_view(df)
