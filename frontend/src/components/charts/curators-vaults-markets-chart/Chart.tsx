"use client";

// React Imports
import { FC, useMemo } from "react";

// Utils Imports
import { formatDate } from "@/utils/formatDate";

// Components Imports
import { OverviewCard } from "./components/OverviewCardProps";

// Hooks Imports
import { useController } from "./hooks/useController";

// Card Imports
import { Card } from "@/components/card/Card";

/**
 * Displays protocols stats like:
 * - Total borrow and supply in USD
 * - Total supplier and borrower rewards in USD and Morpho (toggle)
 */
export const CuratorsVaultsMarketsChart: FC = () => {
  const { datasets, chartRef } = useController();

  // Memoize the current stats
  const { curatorCount, marketCount, vaultCount, startDate, endDate } =
    useMemo(() => {
      if (datasets === null)
        return {
          curatorCount: null,
          marketCount: null,
          vaultCount: null,
          startDate: null,
          endDate: null,
        };

      return {
        curatorCount: datasets[datasets.length - 1].curator_count,
        marketCount: datasets[datasets.length - 1].market_count,
        vaultCount: datasets[datasets.length - 1].vault_count,
        startDate: datasets[0].block_time_day,
        endDate: datasets[datasets.length - 1].block_time_day,
      };
    }, [datasets]);

  return (
    <Card
      title="Curators, Vaults & Markets"
      description="Evolution of the number of active curators, vaults and markets over time."
      datasetIds={["curators-vaults-markets"]}
      cardKind="full"
    >
      {/* Overview Header*/}
      <div className="flex w-full flex-row items-center justify-between px-6">
        <span className="flex flex-col gap-x-4 gap-y-4 sm:flex-row">
          <OverviewCard
            title="Curators"
            colorVariant="blue"
            displayValue={curatorCount?.toString() ?? "-"}
          />
          <OverviewCard
            title="Vaults"
            colorVariant="orange"
            displayValue={vaultCount?.toString() ?? "-"}
          />
          <OverviewCard
            title="Markets"
            colorVariant="purple"
            displayValue={marketCount?.toString() ?? "-"}
          />
        </span>
      </div>

      <div className="relative flex h-full w-full flex-col items-center gap-y-2.5 px-6 pt-1 pb-6">
        {/* Chart */}
        <div ref={chartRef} className="h-60 w-full" />

        {/* Date range */}
        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">
            {formatDate({ timestamp: startDate ?? 0 })}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate({ timestamp: endDate ?? 0 })}
          </p>
        </div>
      </div>
    </Card>
  );
};
