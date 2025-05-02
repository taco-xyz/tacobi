"use client";

// React Imports
import { FC, useMemo } from "react";

// Utils Imports
import { formatDate } from "@/utils/formatDate";

// Hooks Imports
import { useController } from "./controller";

// Card Imports
import { Card } from "@/components/card/Card";

// Chart Imports
import { LineLegend } from "@/components/charts/lib/legends/LineLegend";

/**
 * Displays the number of active curators, vaults and markets over time.
 */
export const MarketsUtilizationChart: FC = () => {
  const { datasets, chartRef } = useController();

  // Memoize the current stats
  const { weightedMarketUtilization, startDate, endDate } = useMemo(() => {
    if (datasets === null)
      return {
        weightedMarketUtilization: null,
        startDate: null,
        endDate: null,
      };

    return {
      weightedMarketUtilization:
        datasets[datasets.length - 1].weighted_market_utilization,
      startDate: datasets[0].block_time_day,
      endDate: datasets[datasets.length - 1].block_time_day,
    };
  }, [datasets]);

  return (
    <Card
      title="Daily Weighted Market Utilization"
      description="Evolution of the market utilization over time."
      datasetIds={["markets-utilization"]}
      cardKind="full"
    >
      {/* Overview Header*/}
      <div className="flex w-full flex-row items-center justify-between px-6">
        <span className="flex flex-col gap-x-4 gap-y-4 sm:flex-row">
          <LineLegend
            title="Weighted Market Utilization"
            colorVariant="blue"
            displayValue={`${weightedMarketUtilization?.toString() ?? ""}%`}
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
