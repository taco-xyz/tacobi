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

// Components Imports
import { Tooltip, TooltipProps } from "./Tooltip";

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
  const [rawDataset] = useDatasets(["curators-vaults-markets"]);

  type DataPoint = ExtractDatasetRequestRowType<typeof rawDataset>;

  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRootRef = useRef<Root>(null);

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
        name: "Vaults",
        encode: {
          x: "block_time_day",
          y: "vault_count",
        },
      },
      {
        ...getSeriesStyle("purple", false),
        name: "Curators",
        encode: {
          x: "block_time_day",
          y: "curator_count",
        },
      },
      // Second Y axis
      {
        ...getSeriesStyle("orange", false),
        name: "Markets",
        encode: {
          x: "block_time_day",
          y: "market_count",
        },
      },
    ];

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
              color: theme === "light" ? "#e5e7eb" : "#111827",
              width: 0.75,
            },
          },
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
            data: DataPoint;
          }>;
          const date = typedParams[0].axisValueLabel;
          const data = typedParams[0].data;

          const year = date.split("-")[0];
          const formattedDate = `${formatDate({ timestamp: date })}, ${year}`;

          // Format the values for display
          const formattedProps: TooltipProps = {
            date: formattedDate,
            vaultCount: data.vault_count.toString(),
            curatorCount: data.curator_count.toString(),
            marketCount: data.market_count.toString(),
          };

          // Render component to the container
          tooltipRootRef.current?.render(<Tooltip {...formattedProps} />);

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
  }, [chart, processedDatasets, theme]);

  return {
    focusedDate,
    setFocusedDate,
    datasets: processedDatasets,
    chartRef,
  };
}
