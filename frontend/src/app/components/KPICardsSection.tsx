"use client";

// React Imports
import { FC, useMemo } from "react";

// TacoBI Imports
import { useTacoBI } from "../tacobi-config";

// Component Imports
import { KPICard } from "@/components/charts/KPICard";

export const KPICardsSection: FC = () => {
  // Fetch the dataset using TacoBI
  const { useDatasets } = useTacoBI();
  const [dailyPricesRequest, tvlRequest, rewardsRequest] = useDatasets([
    "morpho-daily-prices",
    "morpho-tvl",
    "morpho-rewards",
  ]);

  // Split the data into multiple datasets
  const processedDatasets = useMemo(() => {
    if (dailyPricesRequest.state !== "loaded") return null;
    if (tvlRequest.state !== "loaded") return null;
    if (rewardsRequest.state !== "loaded") return null;

    const sortedDailyPrices = dailyPricesRequest.source.sort(
      (a, b) =>
        new Date(a.block_time_day).getTime() -
        new Date(b.block_time_day).getTime(),
    );

    const sortedTvl = tvlRequest.source.sort(
      (a, b) =>
        new Date(a.block_time_day).getTime() -
        new Date(b.block_time_day).getTime(),
    );

    const sortedRewards = rewardsRequest.source.sort(
      (a, b) =>
        new Date(a.block_time_day).getTime() -
        new Date(b.block_time_day).getTime(),
    );

    const datasets = {
      morphoPrice: sortedDailyPrices.map((d): [string, number] => [
        d.block_time_day,
        d.price,
      ]),
      tvl: sortedTvl.map((d): [string, number] => [
        d.block_time_day,
        d.tvl_usd,
      ]),
      morphoRewards: sortedRewards.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_dollars_cumulative,
      ]),
    };

    return datasets;
  }, [dailyPricesRequest, tvlRequest, rewardsRequest]);

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
      <KPICard
        title="TVL"
        data={processedDatasets?.tvl ?? null}
        description="The total amount of assets locked in the protocol."
        datasetIds={["morpho-tvl"]}
      />
      <KPICard
        title="Cumulative Rewards"
        data={processedDatasets?.morphoRewards ?? null}
        description="The cumulative amount of rewards awarded to suppliers and borrowers."
        datasetIds={["morpho-rewards"]}
      />
      <KPICard
        title="$MORPHO Price"
        data={processedDatasets?.morphoPrice ?? null}
        description="The price of the $MORPHO token."
        datasetIds={["morpho-daily-prices"]}
      />
    </div>
  );
};
