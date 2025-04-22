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
  const [datasetRequest] = useDatasets(["protocol-stats"]);

  // Split the data into multiple datasets
  const processedDatasets = useMemo(() => {
    if (datasetRequest.state !== "loaded") return null;

    const sortedDatasets = datasetRequest.source.sort(
      (a, b) =>
        new Date(a.block_time_day).getTime() -
        new Date(b.block_time_day).getTime(),
    );

    const datasets = {
      marketSupply: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.market_supply_assets_USD,
      ]),
      marketBorrow: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.market_borrow_assets_USD,
      ]),
      morphoTokensSupply: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_tokens_supply,
      ]),
      morphoTokensBorrow: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_tokens_borrow,
      ]),
      morphoDollarsSupply: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_dollars_supply,
      ]),
      morphoDollarsBorrow: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.MORPHO_dollars_borrow,
      ]),
      vaultsRevenue: sortedDatasets.map((d): [string, number] => [
        d.block_time_day,
        d.vaults_revenue,
      ]),
    };

    return datasets;
  }, [datasetRequest]);

  // If the data is still loading, don't render anything
  if (!processedDatasets) {
    return null;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <KPICard title="Total Revenue" data={processedDatasets.vaultsRevenue} />
      <KPICard title="Market Supply" data={processedDatasets.marketSupply} />
      <KPICard title="Market Borrow" data={processedDatasets.marketBorrow} />
      <KPICard
        title="Morpho Tokens Supply"
        data={processedDatasets.morphoTokensSupply}
      />
      <KPICard
        title="Morpho Tokens Borrow"
        data={processedDatasets.morphoTokensBorrow}
      />
      <KPICard
        title="Morpho Dollars Supply"
        data={processedDatasets.morphoDollarsSupply}
      />
      <KPICard
        title="Morpho Dollars Borrow"
        data={processedDatasets.morphoDollarsBorrow}
      />
    </div>
  );
};
