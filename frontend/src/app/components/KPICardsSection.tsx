"use client";

// React Imports
import { FC, useMemo } from "react";

// TacoBI Imports
import { useTacoBI } from "../tacobi-config";

// Component Imports
import { KPICard } from "@/components/KPICard";
import { ProtocolStatsChart } from "@/components/ProtocolStatsChart";

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
      marketSupply: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.market_supply_assets_USD,
      ]),
      marketBorrow: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.market_borrow_assets_USD,
      ]),
      morphoTokensSupply: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_tokens_supply,
      ]),
      morphoTokensBorrow: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_tokens_borrow,
      ]),
      morphoDollarsSupply: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_dollars_supply,
      ]),
      morphoDollarsBorrow: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_dollars_borrow,
      ]),
      vaultsRevenue: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.vaults_revenue,
      ]),
    };

    return datasets;
  }, [protocolStatsRequest, marketsCurrentRequest]);

  // If the data is still loading, don't render anything
  if (!processedDatasets) {
    return null;
  }

  return (
    <>
      <div className="grid w-full grid-cols-4 gap-6">
        <KPICard
          title="Curator Revenue"
          data={processedDatasets.vaultsRevenue}
        />
        <KPICard title="Rewards" data={processedDatasets.morphoTokensSupply} />
      </div>
      <div className="h-96 w-full">
        <ProtocolStatsChart />
      </div>
    </>
  );
};
