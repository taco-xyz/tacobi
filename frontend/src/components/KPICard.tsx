// React Imports
import { FC, useEffect, useMemo, useRef, useState } from "react";

// ECharts Imports
import * as echarts from "echarts";

// TacoBI Imports
import { useTacoBI } from "@/app/tacobi-config";
import { ExtractDatasetRowTypeFromDataset } from "@/tacobi/schema";

interface KPICardProps {
  title: string;
  dataset: echarts.DatasetComponentOption;
}

const KPICard: FC<KPICardProps> = ({ title }) => {
  // Fetch the dataset using TacoBI
  const { useDatasets, isLoading } = useTacoBI();
  const [btcDataset] = useDatasets(["bitcoin-price"]);

  // Ref for the chart container
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // State to store the current focused datapoint
  const [currentDatapoint, setCurrentDatapoint] =
    useState<ExtractDatasetRowTypeFromDataset<typeof btcDataset> | null>(null);

  // Memoized option for the chart
  const option: echarts.EChartsOption = useMemo(() => {
    return {
      animation: false,
      textStyle: { fontFamily: `"Geist", monospace` },
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      dataset: [btcDataset],
      xAxis: {
        type: "time",
        interval: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        axisPointer: {
          show: true,
          lineStyle: { color: "oklch(87.2% 0.01 258.338)" },
          label: { show: false },
          z: 0,
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
          encode: { x: "Date", y: "Price" },
          datasetId: "bitcoin-price",
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
    };
  }, [btcDataset]);

  // Initialize the chart
  useEffect(() => {
    if (!chartContainerRef.current || isLoading || !btcDataset) return;

    // Set the current datapoint to the last datapoint in the dataset
    setCurrentDatapoint(btcDataset.source[btcDataset.source.length - 1]);

    // Initialize the chart with the svg renderer
    const chart = echarts.init(chartContainerRef.current, undefined, {
      renderer: "svg",
    });

    // Set the option for the chart
    chart.setOption(option);

    // Event listener that updates the current datapoint when the axis pointer changes (on hover)
    chart.on("updateAxisPointer", (params) => {
      const dataIndex = (params as { dataIndex?: number }).dataIndex;

      // If the dataIndex is not present, set the current datapoint to the last datapoint in the dataset
      if (!dataIndex) {
        setCurrentDatapoint(btcDataset.source[btcDataset.source.length - 1]);
        return;
      }

      // Update the current datapoint to the datapoint at the dataIndex
      setCurrentDatapoint(btcDataset.source[dataIndex]);
    });

    // Event listener that resets the current datapoint when the cursor leaves the chart
    chart.on("globalout", () => {
      setCurrentDatapoint(btcDataset.source[btcDataset.source.length - 1]);
    });

    // Get the chart div and svg wrappers
    const wrapper = chart.getDom().querySelector("div");
    const svg = chart.getDom().querySelector("svg");

    if (!wrapper || !svg) return;

    // Overide their styling to allow point markers to overflow
    wrapper.style.overflow = "visible";
    svg.style.overflow = "visible";

    return () => {
      chart.dispose();
    };
  }, [btcDataset, option, isLoading]);

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200">
      <div className="flex w-full flex-col items-center gap-y-1">
        <h1 className="w-full text-start text-sm font-normal text-gray-500">
          {title}
        </h1>

        <div className="flex h-[28px] w-full flex-row items-center justify-between">
          <p className="font-geist-mono text-lg font-semibold text-gray-700">
            {currentDatapoint?.Price.toLocaleString("en-US", {
              notation: "compact",
              compactDisplay: "short",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm text-gray-500">
            {currentDatapoint?.Date
              ? new Date(currentDatapoint.Date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-y-2.5">
        <div ref={chartContainerRef} className="h-16 w-full overflow-visible" />

        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">
            {btcDataset.source?.[0]?.Date
              ? new Date(btcDataset.source[0].Date).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )
              : ""}
          </p>
          <p className="text-xs text-gray-500">
            {btcDataset.source?.[btcDataset.source.length - 1]?.Date
              ? new Date(
                  btcDataset.source[btcDataset.source.length - 1].Date,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
