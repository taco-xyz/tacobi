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
  const [protocolStatsRequest, marketsCurrentRequest] = useDatasets([
    "protocol-stats",
    "markets-current",
  ]);

  // Split the data into multiple datasets
  const processedDatasets = useMemo(() => {
    if (
      protocolStatsRequest.state !== "loaded" ||
      marketsCurrentRequest.state !== "loaded"
    )
      return null;

    const sortedProtocolStats = protocolStatsRequest.source.sort(
      (a, b) =>
        new Date(a.block_time_day).getTime() -
        new Date(b.block_time_day).getTime(),
    );

    const datasets = {
      morphoTokensSupply: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_tokens_supply,
      ]),
      vaultsRevenue: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.vaults_revenue,
      ]),
    };

    return datasets;
  }, [protocolStatsRequest, marketsCurrentRequest]);

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      <KPICard
        title="Curator Revenue"
        data={processedDatasets?.vaultsRevenue ?? null}
      />
      <KPICard
        title="Rewards"
        data={processedDatasets?.morphoTokensSupply ?? null}
      />
    </div>
  );
};
