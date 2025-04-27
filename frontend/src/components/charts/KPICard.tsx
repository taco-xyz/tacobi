"use client";

// React Imports
import { useEffect, useMemo, useState, FC } from "react";

// Echarts Imports
import * as echarts from "echarts";

// Custom Hooks Imports
import { useEcharts, useEchartsProps } from "@/hooks/useEcharts";

// Utils Imports
import { formatUSDCurrency } from "@/utils/formatUSDCurrency";
import { formatDate } from "@/utils/formatDate";

// Context Imports
import { useTheme } from "@/hooks/useTheme";

// Chart Color Variants Imports
import { getChartColorVariant } from "@/components/charts/lib/chartColorVariants";

// Card Imports
import { Card, CardProps } from "@/components/card/Card";

export interface KPICardProps extends Omit<CardProps, "children" | "cardKind"> {
  data: [string, number][] | null;
}

/**
 * @function KPICard
 * @description This component is used to display a KPI card with a small chart.
 * @param title - The title of the KPI card.
 * @param description - The description of the KPI card.
 * @param datasetIds - The dataset IDs associated with the KPI card.
 * @param data - The data to display in the KPI card.
 * @returns The KPICard component.
 */
export const KPICard: FC<KPICardProps> = ({
  title,
  description,
  datasetIds,
  data,
}) => {
  // Extract the theme from the theme context
  const theme = useTheme();

  // Memoize initOpts to prevent unnecessary re-renders
  const initOpts: useEchartsProps = useMemo(
    () => ({
      initOpts: {
        renderer: "svg",
      },
    }),
    [],
  );

  // Initialize the chart
  const { ref, chart } = useEcharts(initOpts);

  // Memoize the last datapoint to prevent unnecessary re-renders
  const { lastDatapoint, firstDate, lastDate } = useMemo(() => {
    if (!data)
      return {
        lastDatapoint: ["0", 0] as const,
        firstDate: 0,
        lastDate: 0,
      };

    return {
      lastDatapoint: data[data.length - 1],
      firstDate: data[0][0],
      lastDate: data[data.length - 1][0],
    };
  }, [data]);

  // State to store the focused datapoint
  const [focusedDatapoint, setFocusedDatapoint] =
    useState<readonly [string, number]>(lastDatapoint);

  // Update the focused datapoint when the last datapoint changes
  useEffect(() => {
    setFocusedDatapoint(lastDatapoint);
  }, [lastDatapoint]);

  // Setup Echarts with its options
  useEffect(() => {
    // Return early if the chart hasn't been initialized yet
    if (!chart || !data) return;

    // Get the color variant
    const { areaStyle, lineStyle, itemStyle } = getChartColorVariant(
      "blue",
      theme,
    );

    // Define the options
    const option: echarts.EChartsOption = {
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
      yAxis: {
        type: "value",
        show: false,
        max: "dataMax",
      },
      series: [
        {
          type: "line",
          data,
          clip: false,
          lineStyle,
          itemStyle,
          showSymbol: false,
          symbol: "circle",
          symbolSize: 6,
          smooth: true,
          emphasis: { disabled: true },
          areaStyle,
          silent: true,
        },
      ],
    };

    // Set the chart styling
    chart.setOption(option);

    // Event listener that updates the current datapoint when the cursor moves over the chart
    chart.on("updateAxisPointer", (params) => {
      const dataIndex = (params as { dataIndex?: number }).dataIndex;

      // If the dataIndex is not present, set the current datapoint to the last datapoint in the dataset
      if (!dataIndex) {
        setFocusedDatapoint(data?.[data.length - 1] ?? ["", 0]);
        return;
      }

      // Update the current datapoint to the datapoint at the dataIndex
      setFocusedDatapoint(data?.[dataIndex] ?? ["", 0]);
    });

    // Event listener that resets the current datapoint when the cursor leaves the chart
    chart.on("globalout", () => {
      setFocusedDatapoint(data?.[data.length - 1] ?? ["", 0]);
    });

    // Get the chart wrappers
    const wrapper = chart.getDom().querySelector("div");
    const svg = chart.getDom().querySelector("svg");

    if (!wrapper || !svg) return;

    // Override overflow so edge point markers are visible
    wrapper.style.overflow = "visible";
    svg.style.overflow = "visible";
  }, [chart, data, theme]);

  return (
    <Card
      title={title}
      description={description}
      datasetIds={datasetIds}
      cardKind="simple"
    >
      <div className="flex w-full flex-col items-center gap-y-1">
        {/* Title */}
        <h1 className="font-geist-mono w-full text-start text-xs tracking-wide text-gray-500 uppercase">
          {title}
        </h1>
        {/* Current datapoint */}
        <div className="flex h-[28px] w-full flex-row items-center justify-between">
          <p
            className="text-lg font-semibold text-gray-900 dark:text-gray-300"
            style={{ transition: "color 0.2s ease-in-out" }}
          >
            {formatUSDCurrency(focusedDatapoint[1])}
          </p>
          <p className="text-sm text-gray-500">
            {formatDate({ timestamp: focusedDatapoint[0] })}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-y-2.5">
        {/* Chart */}
        <div ref={ref} className="h-10 w-full overflow-visible" />
        {/* Date range */}
        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">
            {formatDate({ timestamp: firstDate })}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate({ timestamp: lastDate })}
          </p>
        </div>
      </div>
    </Card>
  );
};
