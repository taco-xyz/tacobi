"use client";

// React Imports
import { useEffect, useMemo, useState, useRef } from "react";

// React DOM Imports
import { createRoot, Root } from "react-dom/client";

// Custom Hooks Imports
import { useEcharts, useEchartsProps } from "@/hooks/useEcharts";

// Utils Imports
import { formatDate } from "@/utils/formatDate";

// Chart Color Variants
import {
  ChartColorVariant,
  getChartColorVariant,
} from "@/components/charts/lib/chartColorVariants";

// TacoBI Imports
import { useTacoBI } from "@/app/tacobi-config";
import { ExtractDatasetRequestRowType } from "@/tacobi";

// Utils Imports
import { formatUSDCurrency } from "@/utils/formatUSDCurrency";

// Components Imports
import {
  ProtocolStatsTooltip,
  ProtocolStatsTooltipProps,
} from "../components/ProtocolStatsTooltip";

// Custom Hooks Imports
import { useTheme } from "@/hooks/useTheme";

/**
 * Controller hook for the `ProtocolStatsChart` component.
 */
export function useController() {
  // Initial options for the chart
  const initOpts: useEchartsProps = useMemo(
    () => ({
      initOpts: {
        renderer: "svg",
      },
    }),
    [],
  );

  // Extract the current theme
  const theme = useTheme();

  // Initialize the chart
  const { ref: chartRef, chart } = useEcharts(initOpts);

  // Dataset fetching
  const { useDatasets } = useTacoBI();
  const [rawDataset] = useDatasets(["protocol-stats"]);

  type ProtocolStat = ExtractDatasetRequestRowType<typeof rawDataset>;

  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRootRef = useRef<Root>(null);

  // Whether to display rewards (not supply and borrow) using USD or $MORPHO token
  const [rewardsCurrency, setRewardsCurrency] = useState<"USD" | "MORPHO">(
    "USD",
  );

  // Memoized the processed (sorted) datasets
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

  // Initialize the tooltip container
  useEffect(() => {
    if (!tooltipContainerRef.current) {
      tooltipContainerRef.current = document.createElement("div");
      tooltipRootRef.current = createRoot(tooltipContainerRef.current);
    }
  }, []);

  // Update the chart options continuously
  useEffect(() => {
    if (!chart || !processedDatasets) return;

    // Function to fetch the series style
    const getSeriesStyle = (colorVariant: ChartColorVariant, area: boolean) => {
      const { areaStyle, lineStyle, itemStyle } = getChartColorVariant(
        colorVariant,
        theme,
      );
      return {
        type: "line" as const,
        clip: false,
        lineStyle: lineStyle,
        areaStyle: area ? areaStyle : undefined,
        itemStyle: itemStyle,
        silent: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        smooth: true,
        emphasis: { disabled: true },
      };
    };

    // Specify the series to display
    const series = [
      // First Y axis
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
      // Second Y axis
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

    // Constructh the option
    const options: echarts.EChartsOption = {
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
          lineStyle: { color: theme === "light" ? "#9ca3af" : "#374151" },
          label: { show: false },
          z: 0,
          snap: true,
        },
      },
      yAxis: [
        {
          type: "value",
          show: true,
          position: "left",
          axisLabel: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: theme === "light" ? "#e5e7eb" : "#1f2937",
              width: 1,
            },
          },
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
        trigger: "axis" as const,
        axisPointer: {
          show: true,
          snap: true,
        },
        backgroundColor: "transparent" as const,
        borderWidth: 0,
        shadowBlur: 0,
        padding: 0,
        confine: true,
        extraCssText: "box-shadow: none;" as const,
        formatter: (params) => {
          // Return empty string if no container
          if (!tooltipContainerRef.current) return "";

          // Type the params
          const typedParams = params as unknown as Array<{
            axisValueLabel: string;
            data: ProtocolStat;
          }>;
          const date = typedParams[0].axisValueLabel;
          const data = typedParams[0].data;

          const year = date.split("-")[0];
          const formattedDate = `${formatDate({ timestamp: date })}, ${year}`;

          // Format the values for display
          const formattedProps: ProtocolStatsTooltipProps = {
            date: formattedDate,
            borrow: formatUSDCurrency(data.market_borrow_assets_USD),
            supply: formatUSDCurrency(data.market_supply_assets_USD),
            supplierRewards: formatUSDCurrency(data.MORPHO_dollars_supply),
            borrowerRewards: formatUSDCurrency(data.MORPHO_dollars_borrow),
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
    };

    // Set the chart styling
    chart.setOption(options);

    // Get the chart wrappers
    const wrapper = chart.getDom().querySelector("div");
    const svg = chart.getDom().querySelector("svg");

    if (!wrapper || !svg) return;

    // Override overflow so edge point markers are visible
    wrapper.style.overflow = "visible";
    svg.style.overflow = "visible";
  }, [chart, processedDatasets, rewardsCurrency, theme]);

  return {
    focusedDate,
    setFocusedDate,
    rewardsCurrency,
    setRewardsCurrency,
    datasets: processedDatasets,
    chartRef,
  };
}
