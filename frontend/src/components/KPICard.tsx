"use client";

// React Imports
import { useEffect, useMemo, useState } from "react";

// Echarts Imports
import * as echarts from "echarts";

// Custom Hooks Imports
import { useEcharts, useEchartsProps } from "@/hooks/useEcharts";

// Utils Imports
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

/**
 * KPICard Props
 *
 * @description The props for the KPICard component.
 * @property {string} title - The title of the KPI card.
 * @property {Array<[string, number]>} data - The data to display in the KPI card.
 */
export interface KPICardProps {
  title: string;
  data: [string, number][];
}

/**
 * KPICard Component
 *
 * @description This component is used to display a KPI card with a small chart.
 * @param {string} title - The title of the KPI card.
 * @param {Array<[string, number]>} data - The data to display in the KPI card.
 * @returns {JSX.Element} The KPICard component.
 */
export const KPICard = ({ title, data }: KPICardProps) => {
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

  // State to store the focused datapoint
  const [focusedDatapoint, setFocusedDatapoint] = useState<[string, number]>(
    data[data.length - 1],
  );

  // Setup Echarts with its options
  useEffect(() => {
    // Return early if the chart hasn't been initialized yet
    if (!chart) return;

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
          lineStyle: { color: "rgba(59, 130, 246, 1)", width: 1.5 },
          showSymbol: false,
          smooth: true,
          cursor: "pointer",
          emphasis: { disabled: true },
          color: ["rgba(59, 130, 246, 1)"],
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(219, 232, 253, 1)" },
              { offset: 1, color: "rgba(219, 232, 253, 0)" },
            ]),
          },
          silent: true,
        },
      ],
    });

    // Event listener that updates the current datapoint when the cursor moves over the chart
    chart.on("updateAxisPointer", (params) => {
      const dataIndex = (params as { dataIndex?: number }).dataIndex;

      // If the dataIndex is not present, set the current datapoint to the last datapoint in the dataset
      if (!dataIndex) {
        setFocusedDatapoint(data[data.length - 1]);
        return;
      }

      // Update the current datapoint to the datapoint at the dataIndex
      setFocusedDatapoint(data[dataIndex]);
    });

    // Event listener that resets the current datapoint when the cursor leaves the chart
    chart.on("globalout", () => {
      setFocusedDatapoint(data[data.length - 1]);
    });

    // Get the chart wrappers
    const wrapper = chart.getDom().querySelector("div");
    const svg = chart.getDom().querySelector("svg");

    if (!wrapper || !svg) return;

    // Override overflow so edge point markers are visible
    wrapper.style.overflow = "visible";
    svg.style.overflow = "visible";
  }, [chart, data]);

  // If the data is empty, don't render anything
  if (data.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200">
      <div className="flex w-full flex-col items-center gap-y-1">
        {/* Title */}
        <h1 className="w-full text-start text-sm font-normal text-gray-500">
          {title}
        </h1>

        {/* Current datapoint */}
        <div className="flex h-[28px] w-full flex-row items-center justify-between">
          <p className="font-geist-mono text-lg font-semibold text-gray-700">
            {formatCurrency(focusedDatapoint[1])}
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(focusedDatapoint[0])}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-y-2.5">
        {/* Chart */}
        <div ref={ref} className="h-16 w-full overflow-visible" />

        {/* Date range */}
        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">{formatDate(data[0][0])}</p>
          <p className="text-xs text-gray-500">
            {formatDate(data[data.length - 1][0])}
          </p>
        </div>
      </div>
    </div>
  );
};
