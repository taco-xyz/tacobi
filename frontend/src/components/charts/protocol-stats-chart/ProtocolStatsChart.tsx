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
      className="flex w-full flex-col gap-y-6 overflow-hidden rounded-lg bg-white shadow ring ring-gray-200 dark:bg-gray-950/50 dark:ring-gray-900"
      style={{
        transition:
          "box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out",
      }}
    >
      {/* Title */}
      <div
        className="flex w-full flex-row items-center justify-between gap-x-10 border-b border-gray-200 bg-gray-50 p-6 dark:border-gray-900 dark:bg-gray-950/50"
        style={{
          transition:
            "border-color 0.2s ease-in-out, background-color 0.2s ease-in-out",
        }}
      >
        <div className="flex w-full flex-col gap-y-2">
          <h1
            className="font-geist-mono w-full text-start text-xs font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-300"
            style={{
              transition: "color 0.2s ease-in-out",
            }}
          >
            Rewards & Assets
          </h1>
          <p className="text-sm text-gray-500">
            The total amount of assets borrowed and supplied, and the total
            amount of rewards for suppliers and borrowers.
          </p>
        </div>

        {/*           
          <div className="flex flex-row items-center gap-x-3">
            <div className="relative flex flex-shrink-0 items-center justify-center">
              <div className="absolute size-2 flex-shrink-0 animate-ping rounded-full bg-green-600 duration-1000 ease-in-out dark:bg-green-900" />
              <div className="absolute size-2 flex-shrink-0 animate-pulse rounded-full bg-green-500 duration-1000 ease-in-out dark:bg-green-700" />
            </div>
            <p className="text-xs whitespace-nowrap text-gray-500">
              Last updated: {formatDate({ timestamp: Date.now() })}
            </p>
          </div> */}

        {/*Menu Button*/}
        <div className="group flex h-fit flex-shrink-0 cursor-pointer flex-col items-center gap-y-1 p-3">
          <div
            className="group-hover:animate-up-down-1 size-1 rounded-full bg-gray-400 group-hover:bg-gray-500 dark:bg-gray-500 group-hover:dark:bg-gray-400"
            style={{
              transition: "background-color 0.3s ease-in-out",
            }}
          />
          <div
            className="group-hover:animate-up-down-2 size-1 rounded-full bg-gray-400 group-hover:bg-gray-500 dark:bg-gray-500 group-hover:dark:bg-gray-400"
            style={{
              transition: "background-color 0.3s ease-in-out",
            }}
          />
          <div
            className="group-hover:animate-up-down-3 size-1 rounded-full bg-gray-400 group-hover:bg-gray-500 dark:bg-gray-500 group-hover:dark:bg-gray-400"
            style={{
              transition: "background-color 0.3s ease-in-out",
            }}
          />
        </div>
      </div>

      {/* Overview Header*/}
      <div className="flex w-full flex-row items-center justify-between px-6">
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
