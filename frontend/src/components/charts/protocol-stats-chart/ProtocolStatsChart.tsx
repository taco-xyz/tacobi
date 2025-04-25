"use client";

// React Imports
import { FC, useMemo } from "react";

// Utils Imports
import { formatDate } from "@/utils/formatDate";

// Utils Imports
import { formatUSDCurrency } from "@/utils/formatUSDCurrency";

// Components Imports
import { OverviewCard } from "./components/OverviewCardProps";

// Hooks Imports
import { useController } from "./hooks/useController";

/**
 * Displays protocols stats like:
 * - Total borrow and supply in USD
 * - Total supplier and borrower rewards in USD and Morpho (toggle)
 */
export const ProtocolStatsChart: FC = () => {
  const { datasets, chartRef } = useController();

  // Memoize the current stats
  const {
    marketBorrowAssetsUSD,
    marketSupplyAssetsUSD,
    morphoDollarsSupply,
    morphoDollarsBorrow,
    startDate,
    endDate,
  } = useMemo(() => {
    if (datasets === null)
      return {
        marketBorrowAssetsUSD: null,
        marketSupplyAssetsUSD: null,
        morphoDollarsSupply: null,
        morphoDollarsBorrow: null,
        startDate: null,
        endDate: null,
      };

    return {
      marketBorrowAssetsUSD: formatUSDCurrency(
        datasets[datasets.length - 1].market_borrow_assets_USD,
      ),
      marketSupplyAssetsUSD: formatUSDCurrency(
        datasets[datasets.length - 1].market_supply_assets_USD,
      ),
      morphoDollarsSupply: formatUSDCurrency(
        datasets[datasets.length - 1].MORPHO_dollars_supply,
      ),
      morphoDollarsBorrow: formatUSDCurrency(
        datasets[datasets.length - 1].MORPHO_dollars_borrow,
      ),
      startDate: datasets[0].block_time_day,
      endDate: datasets[datasets.length - 1].block_time_day,
    };
  }, [datasets]);

  return (
    <div
      className="flex w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200 transition-all duration-200 dark:bg-gray-900/25 dark:ring-gray-900"
      style={{
        transition: "box-shadow 0.2s ease-in-out",
      }}
    >
      {/* Title */}
      <div className="flex w-full flex-col gap-y-2">
        <h1 className="w-full text-start font-mono text-sm font-normal text-gray-500 uppercase dark:text-gray-400">
          Rewards & Assets
        </h1>
        <p className="text-sm text-gray-500">
          The total amount of assets borrowed and supplied, as well as the total
          amount of rewards for suppliers and borrowers.
        </p>
      </div>

      {/* Overview Header*/}
      <div className="flex w-full flex-row items-center justify-between">
        <span className="flex flex-col gap-x-4 gap-y-4 sm:flex-row">
          <OverviewCard
            title="Borrow"
            colorVariant="blue"
            displayValue={marketBorrowAssetsUSD ?? "-"}
          />
          <OverviewCard
            title="Supply"
            colorVariant="purple"
            displayValue={marketSupplyAssetsUSD ?? "-"}
          />
        </span>
        <span className="flex flex-col gap-x-4 gap-y-4 sm:flex-row">
          <OverviewCard
            title="Supplier Rewards*"
            colorVariant="orange"
            displayValue={morphoDollarsSupply ?? "-"}
          />
          <OverviewCard
            title="Borrower Rewards*"
            colorVariant="red"
            displayValue={morphoDollarsBorrow ?? "-"}
          />
        </span>
      </div>

      <div className="relative mt-5 flex h-full w-full flex-col items-center gap-y-2.5">
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

        <p
          className="mt-2 w-full text-xs text-gray-500 dark:text-gray-500"
          style={{
            transition: "color 0.2s ease-in-out",
          }}
        >
          * Rewards values are scaled in the y axis
        </p>
      </div>
    </div>
  );
};
