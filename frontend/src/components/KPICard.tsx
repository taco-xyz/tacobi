// React Imports
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

// ECharts Imports
import * as echarts from "echarts";

// TacoBI Imports
import { useTacoBI } from "@/app/tacobi-config";
import { ExtractDatasetRequestRowType } from "@/tacobi/schema";

interface KPICardProps {
  title: string;
  dataset: echarts.DatasetComponentOption;
}

const KPICard: FC<KPICardProps> = ({ title }) => {
  // Fetch the dataset using TacoBI
  const { useDatasets } = useTacoBI();
  const [datasetRequest] = useDatasets(["protocol-stats"]);

  const datasetLoaded = useMemo(() => {
    return datasetRequest.state === "loaded" ? datasetRequest : null;
  }, [datasetRequest]);

  // Ref for the chart container
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // State to store the current focused datapoint
  const [currentDatapoint, setCurrentDatapoint] =
    useState<ExtractDatasetRequestRowType<typeof datasetRequest> | null>(null);

  // Memoized option for the chart
  const getOption = useCallback(
    (dataset: NonNullable<typeof datasetLoaded>) => {
      return {
        animation: false,
        textStyle: { fontFamily: `"Geist", monospace` },
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        dataset: [dataset],
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
    },
    [],
  );

  // Initialize the chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!datasetLoaded) return;

    // Set the current datapoint to the last datapoint in the dataset
    setCurrentDatapoint(datasetLoaded.source[datasetLoaded.source.length - 1]);

    // Initialize the chart with the svg renderer
    const chart = echarts.init(chartContainerRef.current, undefined, {
      renderer: "svg",
    });

    // Set the option for the chart
    chart.setOption(getOption(datasetLoaded));

    // Event listener that updates the current datapoint when the axis pointer changes (on hover)
    chart.on("updateAxisPointer", (params) => {
      const dataIndex = (params as { dataIndex?: number }).dataIndex;

      // If the dataIndex is not present, set the current datapoint to the last datapoint in the dataset
      if (!dataIndex) {
        setCurrentDatapoint(
          datasetLoaded.source[datasetLoaded.source.length - 1],
        );
        return;
      }

      // Update the current datapoint to the datapoint at the dataIndex
      setCurrentDatapoint(datasetLoaded.source[dataIndex]);
    });

    // Event listener that resets the current datapoint when the cursor leaves the chart
    chart.on("globalout", () => {
      setCurrentDatapoint(
        datasetLoaded.source[datasetLoaded.source.length - 1],
      );
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
  }, [datasetLoaded, getOption]);

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200">
      <div className="flex w-full flex-col items-center gap-y-1">
        <h1 className="w-full text-start text-sm font-normal text-gray-500">
          {title}
        </h1>

        <div className="flex h-[28px] w-full flex-row items-center justify-between">
          <p className="font-geist-mono text-lg font-semibold text-gray-700">
            {currentDatapoint?.market_supply_assets_USD.toLocaleString(
              "en-US",
              {
                notation: "compact",
                compactDisplay: "short",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>
          <p className="text-sm text-gray-500">
            {currentDatapoint?.block_time_day
              ? new Date(currentDatapoint.block_time_day).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                )
              : ""}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-y-2.5">
        <div ref={chartContainerRef} className="h-16 w-full overflow-visible" />

        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">
            {datasetLoaded.source?.[0]?.block_time_day
              ? new Date(
                  datasetLoaded.source[0].block_time_day,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </p>
          <p className="text-xs text-gray-500">
            {datasetLoaded.source?.[datasetLoaded.source.length - 1]
              ?.block_time_day
              ? new Date(
                  datasetLoaded.source[
                    datasetLoaded.source.length - 1
                  ].block_time_day,
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
