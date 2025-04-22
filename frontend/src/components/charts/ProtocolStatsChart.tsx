"use client";

// React Imports
import { useEffect, useMemo, useState, FC, useRef } from "react";

// Custom Hooks Imports
import { useEcharts, useEchartsProps } from "@/hooks/useEcharts";

// Utils Imports
import { formatDate } from "@/utils/formatDate";

// Chart Color Variants
import {
  ChartColorVariant,
  getChartColorVariant,
} from "@/components/charts/lib/chartColorVariants";
import { useTacoBI } from "@/app/tacobi-config";
import { currencyFormatter } from "@/lib/formatters";

import { createRoot, Root } from "react-dom/client";
import { ExtractDatasetRequestRowType } from "@/tacobi";

/**
 * Protocol stats tooltip props.
 * @property date - The date of the tooltip.
 * @property borrow - The borrow value of the tooltip.
 * @property supply - The supply value of the tooltip.
 * @property supplierRewards - The supplier rewards value of the tooltip.
 * @property borrowerRewards - The borrower rewards value of the tooltip.
 */
export interface ProtocolStatsTooltipProps {
  date: string;
  borrow: string;
  supply: string;
  supplierRewards: string;
  borrowerRewards: string;
}

/**
 * Protocol stats tooltip component.
 * @param props - The props for the component.
 */
const ProtocolStatsTooltip: FC<ProtocolStatsTooltipProps> = ({
  date,
  borrow,
  supply,
  supplierRewards,
  borrowerRewards,
}) => {
  return (
    <div className="flex flex-col gap-y-1.5 rounded-md bg-white/50 p-3 text-xs text-gray-900 shadow-2xl ring shadow-gray-500/15 ring-gray-200/50 backdrop-blur-xs">
      <div className="font-semibold">{date}</div>
      <div className="h-px w-full bg-gray-200" />
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700">
          <div className="h-1 w-4 rounded-sm bg-blue-500" />
          Borrow
        </span>
        <span className="pl-8 font-medium text-gray-900">{borrow}</span>
      </span>
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700">
          <div className="h-1 w-4 rounded-sm bg-purple-500" />
          Supply
        </span>
        <span className="pl-8 font-medium text-gray-900">{supply}</span>
      </span>
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700">
          <div className="h-1 w-4 rounded-sm bg-orange-500" />
          Supplier Rewards
        </span>
        <span className="pl-8 font-medium text-gray-900">
          {supplierRewards}
        </span>
      </span>
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700">
          <div className="h-1 w-4 rounded-sm bg-red-500" />
          Borrower Rewards
        </span>
        <span className="pl-8 font-medium text-gray-900">
          {borrowerRewards}
        </span>
      </span>
    </div>
  );
};

/**
 * Small Overview Card Props
 * @property title - The title of the KPI card.
 * @property colorVariant - The color variant of the KPI card.
 * @property displayValue - The value to display in the KPI card at the bottom.
 */
export interface OverviewCardProps {
  title: string;
  colorVariant: ChartColorVariant;
  displayValue: string;
}

/**
 * Stat overview card component.
 * @param props - The props for the component.
 * @returns The component.
 */
export const OverviewCard: FC<OverviewCardProps> = ({
  title,
  colorVariant,
  displayValue,
}) => {
  return (
    <div className="flex flex-col items-start gap-y-0.5">
      <span className="flex flex-row items-center gap-x-1.5">
        <div
          style={{
            backgroundColor: getChartColorVariant(colorVariant).color,
          }}
          className="h-1 w-6 rounded-sm"
        />
        <h1 className="w-full text-start text-xs font-normal text-gray-700">
          {title}
        </h1>
      </span>
      <p className="text-md font-semibold text-gray-900">{displayValue}</p>
    </div>
  );
};

/**
 * ECharts props for the `ProtocolStatsChart` component.
 */
const echartsProps: useEchartsProps = {
  initOpts: {
    renderer: "svg",
  },
};

/**
 * Controller hook for the `ProtocolStatsChart` component.
 */
function useController() {
  // Dataset fetching
  const { useDatasets } = useTacoBI();
  const [rawDataset] = useDatasets(["protocol-stats"]);

  type ProtocolStat = ExtractDatasetRequestRowType<typeof rawDataset>;

  const tooltipContainerRef = useRef<HTMLDivElement>(
    document.createElement("div"),
  );
  const tooltipRootRef = useRef<Root>(null);

  // Whether to display rewards (not supply and borrow) using USD or $MORPHO
  const [rewardsCurrency, setRewardsCurrency] = useState<"USD" | "MORPHO">(
    "USD",
  );

  const processedDatasets = useMemo(() => {
    if (rawDataset.state !== "loaded") return null;

    const sortedProtocolStats = rawDataset.source.sort(
      (a, b) =>
        new Date(a.block_time_day).getTime() -
        new Date(b.block_time_day).getTime(),
    );

    return sortedProtocolStats;
  }, [rawDataset]);

  // Focused date for tooltip display and position
  const [focusedDate, setFocusedDate] = useState<string>("");

  // Initialize the chart
  const { ref: chartRef, chart } = useEcharts(echartsProps);

  // Update the chart options continuously
  useEffect(() => {
    if (!chart || !processedDatasets) return;

    // Initialize the tooltip container
    if (!tooltipRootRef.current) {
      tooltipRootRef.current = createRoot(tooltipContainerRef.current);
    }

    const getSeriesStyle = (colorVariant: ChartColorVariant, area: boolean) => {
      const { areaStyle, lineStyle } = getChartColorVariant(colorVariant);
      return {
        lineStyle: lineStyle,
        color: [lineStyle.color],
        areaStyle: area ? areaStyle : undefined,
        silent: true,
        type: "line",
        clip: false,
        showSymbol: false,
        smooth: true,
        cursor: "pointer",
        emphasis: { disabled: true },
      };
    };

    const series = [
      {
        ...getSeriesStyle("blue", false),
        name: "Borrow",
        yAxisIndex: 0,
        encode: {
          x: "block_time_day",
          y: "market_borrow_assets_USD",
        },
      },
      {
        ...getSeriesStyle("purple", false),
        name: "Supply",
        yAxisIndex: 0,
        encode: {
          x: "block_time_day",
          y: "market_supply_assets_USD",
        },
      },
      {
        ...getSeriesStyle("orange", true),
        name: "Supplier Rewards",
        yAxisIndex: 1,
        encode: {
          x: "block_time_day",
          y:
            rewardsCurrency === "USD"
              ? "MORPHO_dollars_supply"
              : "MORPHO_tokens_supply",
        },
      },
      {
        ...getSeriesStyle("red", true),
        name: "Borrower Rewards",
        yAxisIndex: 1,
        encode: {
          x: "block_time_day",
          y:
            rewardsCurrency === "USD"
              ? "MORPHO_dollars_borrow"
              : "MORPHO_tokens_borrow",
        },
      },
    ];

    // We need to calculate the scale of the rewards axis based on the currency
    // So that we can display it as only a fraction of the total scale to
    // represent the relativity
    const maxRewards =
      rewardsCurrency === "USD"
        ? Math.max(
            ...processedDatasets.map((d) => d.MORPHO_dollars_supply),
            ...processedDatasets.map((d) => d.MORPHO_dollars_borrow),
          )
        : Math.max(
            ...processedDatasets.map((d) => d.MORPHO_tokens_supply),
            ...processedDatasets.map((d) => d.MORPHO_tokens_borrow),
          );

    // Set the chart styling
    chart.setOption({
      animation: false,
      textStyle: { fontFamily: `"Geist", monospace` },
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        type: "time",
        interval: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        axisPointer: {
          show: true,
          lineStyle: { color: "#9ca3af" },
          label: { show: false },
          z: 0,
          snap: true,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Borrow & Supply",
          show: true,
          max: "dataMax",
          position: "left",
        },
        {
          type: "value",
          name: "Rewards",
          show: false,
          max: maxRewards * 2,
          position: "right",
        },
      ],
      dataset: {
        source: processedDatasets,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          show: true,
          snap: true,
        },
        backgroundColor: "transparent",
        borderWidth: 0,
        shadowBlur: 0,
        padding: 0,
        extraCssText: "box-shadow: none;",
        formatter: (
          params: Array<{ axisValueLabel: string; data: ProtocolStat }>,
        ) => {
          const date = params[0].axisValueLabel;
          const data = params[0].data as ProtocolStat;

          const year = date.split("-")[0];
          const formattedDate = `${formatDate(date)}, ${year}`;

          // Format the values for display
          const formattedProps: ProtocolStatsTooltipProps = {
            date: formattedDate,
            borrow: currencyFormatter.format(data.market_borrow_assets_USD),
            supply: currencyFormatter.format(data.market_supply_assets_USD),
            supplierRewards: currencyFormatter.format(
              data.MORPHO_dollars_supply,
            ),
            borrowerRewards: currencyFormatter.format(
              data.MORPHO_dollars_borrow,
            ),
          };

          // Render component to the container
          tooltipRootRef.current?.render(
            <ProtocolStatsTooltip {...formattedProps} />,
          );

          // Return the container DOM element
          return tooltipContainerRef.current;
        },
      },
      series: series,
    });

    return () => {
      tooltipRootRef.current?.unmount();
    };
  }, [chart, processedDatasets, rewardsCurrency]);

  return {
    focusedDate,
    setFocusedDate,
    rewardsCurrency,
    setRewardsCurrency,
    datasets: processedDatasets,
    chartRef,
  };
}

/**
 * Displays protocols stats like:
 * - Total borrow and supply in USD
 * - Total supplier and borrower rewards in USD and Morpho (toggle)
 */
export const ProtocolStatsChart: FC = () => {
  const { datasets, chartRef } = useController();

  if (datasets === null) return null;

  return (
    <div className="flex h-full w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200">
      <div className="flex w-full flex-col items-center gap-y-1">
        {/* Title */}
        <h1 className="w-full text-start text-sm font-semibold text-gray-900">
          Protocol Overview
        </h1>
      </div>

      <div className="flex w-full flex-row justify-start gap-x-4">
        <span className="flex flex-row gap-x-4">
          <OverviewCard
            title="Borrow"
            colorVariant="blue"
            displayValue={currencyFormatter.format(
              datasets[datasets.length - 1].market_borrow_assets_USD,
            )}
          />
          <OverviewCard
            title="Supply"
            colorVariant="purple"
            displayValue={currencyFormatter.format(
              datasets[datasets.length - 1].market_supply_assets_USD,
            )}
          />
        </span>
        <span className="ml-auto flex flex-row gap-x-4">
          <OverviewCard
            title="Supplier Rewards"
            colorVariant="orange"
            displayValue={currencyFormatter.format(
              datasets[datasets.length - 1].MORPHO_dollars_supply,
            )}
          />
          <OverviewCard
            title="Borrower Rewards"
            colorVariant="red"
            displayValue={currencyFormatter.format(
              datasets[datasets.length - 1].MORPHO_dollars_borrow,
            )}
          />
        </span>
      </div>

      <div className="flex h-full w-full flex-col items-center gap-y-2.5">
        {/* Chart */}
        <div ref={chartRef} className="h-full w-full overflow-visible" />

        {/* Date range */}
        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">
            {formatDate(datasets[0].block_time_day)}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(datasets[datasets.length - 1].block_time_day)}
          </p>
        </div>
      </div>
    </div>
  );
};
