"use client";

// React Imports
import {
  useEffect,
  useMemo,
  useState,
  FC,
  createContext,
  useContext,
} from "react";

// Custom Hooks Imports
import { useEcharts, useEchartsProps } from "@/hooks/useEcharts";

// Utils Imports
import { formatDate } from "@/utils/formatDate";

// Chart Color Variants
import {
  ChartColorVariant,
  getChartColorVariant,
} from "@/lib/chartColorVariants";
import { useTacoBI } from "@/app/tacobi-config";
import { currencyFormatter } from "@/lib/formatters";

/**
 * Data point for a KPI card
 * [date, value]
 */
type DataPoint = [string, number];

/**
 * Individual data for a KPI card
 * @property title - The title of the KPI card.
 * @property data - The data to display in the KPI card.
 * @property displayValue - The value to display in the KPI card at the bottom.
 * @property colorVariant - The color variant of the KPI card.
 */
interface KPICardDataset {
  title: string;
  data: DataPoint[];
  colorVariant: ChartColorVariant;
  displayValue: string;
}

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
 * KPICardCompound Props
 *
 * @description The props for the KPICardCompound component.
 * @property title - The title of the KPI card.
 * @property datasets - The datasets to display in the KPI card.
 */
export interface KPICardCompoundProps {
  title: string;
  datasets: KPICardDataset[];
}

/**
 * KPICard Component
 *
 * @description This component is used to display a KPI card with a small chart.
 * @param title - The title of the KPI card.
 * @param datasets - The datasets to display in the KPI card.
 * @returns The KPICardCompound component.
 */
export const ProtocolStatsChartaasd = ({
  title,
  datasets,
}: KPICardCompoundProps) => {
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
  const [focusedDate, setFocusedDate] = useState<string>(
    datasets[datasets.length - 1].data[
      datasets[datasets.length - 1].data.length - 1
    ][0],
  );

  const focusedDataPoints = useMemo(() => {
    return datasets.map((d) => {
      const index = d.data.findIndex(([date]) => date === focusedDate);
      return d.data[index];
    });
  }, [datasets, focusedDate]);

  // Setup ECharts options
  useEffect(() => {
    // Return early if the chart hasn't been initialized yet
    if (!chart) return;

    // Compute series
    const series = datasets.map((d) => {
      const { areaStyle, lineStyle } = getChartColorVariant(d.colorVariant);
      return {
        type: "line",
        data: d.data,
        clip: false,
        lineStyle: lineStyle,
        showSymbol: false,
        smooth: true,
        cursor: "pointer",
        emphasis: { disabled: true },
        color: [lineStyle.color],
        areaStyle,
        silent: true,
        name: d.title,
      };
    });

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
      datasets,
      series: series,
    });

    // Event listener that updates the current datapoint when the cursor moves over the chart
    chart.on("updateAxisPointer", (params) => {
      const dataIndex = (params as { dataIndex?: number }).dataIndex;

      // If the dataIndex is not present, set the current datapoint to the last datapoint in the dataset
      if (!dataIndex) {
        setFocusedDate(
          datasets[datasets.length - 1].data[
            datasets[datasets.length - 1].data.length - 1
          ][0],
        );
        return;
      }

      // Update the current datapoint to the datapoint at the dataIndex
      setFocusedDate(datasets[0].data[dataIndex][0]);
    });

    // Event listener that resets the current datapoint when the cursor leaves the chart
    chart.on("globalout", () => {
      setFocusedDate(
        datasets[datasets.length - 1].data[
          datasets[datasets.length - 1].data.length - 1
        ][0],
      );
    });

    // Get the chart wrappers
    const wrapper = chart.getDom().querySelector("div");
    const svg = chart.getDom().querySelector("svg");

    if (!wrapper || !svg) return;

    // Override overflow so edge point markers are visible
    wrapper.style.overflow = "visible";
    svg.style.overflow = "visible";
  }, [chart, datasets]);

  // If the data is empty, don't render anything
  if (datasets.length === 0) return null;

  return (
    <div className="flex h-full w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200">
      <div className="flex w-full flex-col items-center gap-y-1">
        {/* Title */}
        <h1 className="w-full text-start text-sm font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      <div className="flex w-full flex-row justify-start gap-x-4">
        {datasets.map((d) => (
          <OverviewCard
            key={d.title}
            title={d.title}
            colorVariant={d.colorVariant}
            displayValue={d.displayValue}
          />
        ))}
      </div>

      <div className="flex h-full w-full flex-col items-center gap-y-2.5">
        {/* Chart */}
        <div ref={ref} className="h-full w-full overflow-visible" />

        {/* Date range */}
        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">
            {formatDate(datasets[0].data[0][0])}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(datasets[0].data[0][0])}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ProtocolDatasets {
  dailyBorrow: DataPoint[];
  dailySupply: DataPoint[];
  dailySupplierRewards: DataPoint[];
  dailyBorrowerRewards: DataPoint[];
}

type ProtocolStatsContextType = {
  focusedDate: string;
  setFocusedDate: (date: string) => void;
  rewardsCurrency: "USD" | "MORPHO";
  setRewardsCurrency: (currency: "USD" | "MORPHO") => void;
  datasets: ProtocolDatasets | null;
  chartRef: React.RefObject<HTMLDivElement | null> | null;
};

const context = createContext<ProtocolStatsContextType>({
  focusedDate: "",
  setFocusedDate: () => {},
  rewardsCurrency: "USD",
  setRewardsCurrency: () => {},
  datasets: null,
  chartRef: null,
});

const ProtocolStatsChartView: FC = () => {
  const { datasets, chartRef } = useContext(context);

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
              datasets.dailyBorrow[datasets.dailyBorrow.length - 1][1],
            )}
          />
          <OverviewCard
            title="Supply"
            colorVariant="purple"
            displayValue={currencyFormatter.format(
              datasets.dailySupply[datasets.dailySupply.length - 1][1],
            )}
          />
        </span>
        <span className="ml-auto flex flex-row gap-x-4">
          <OverviewCard
            title="Supplier Rewards"
            colorVariant="orange"
            displayValue={currencyFormatter.format(
              datasets.dailySupplierRewards[
                datasets.dailySupplierRewards.length - 1
              ][1],
            )}
          />
          <OverviewCard
            title="Borrower Rewards"
            colorVariant="red"
            displayValue={currencyFormatter.format(
              datasets.dailyBorrowerRewards[
                datasets.dailyBorrowerRewards.length - 1
              ][1],
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
            {formatDate(datasets.dailyBorrow[0][0])}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(
              datasets.dailyBorrow[datasets.dailyBorrow.length - 1][0],
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

// Memoize initOpts to prevent unnecessary re-renders
const echartsProps: useEchartsProps = {
  initOpts: {
    renderer: "svg",
  },
};

export const ProtocolStatsChart: FC = () => {
  // Dataset fetching
  const { useDatasets } = useTacoBI();
  const [rawDataset] = useDatasets(["protocol-stats"]);

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

    const historicalDatasets = {
      dailyBorrow: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.market_supply_assets_USD,
      ]),
      dailySupply: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        d.market_borrow_assets_USD,
      ]),
      dailySupplierRewards: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        rewardsCurrency === "USD"
          ? d.MORPHO_dollars_supply
          : d.MORPHO_tokens_supply,
      ]),
      dailyBorrowerRewards: sortedProtocolStats.map((d): [string, number] => [
        d.block_time_day,
        rewardsCurrency === "USD"
          ? d.MORPHO_dollars_borrow
          : d.MORPHO_tokens_borrow,
      ]),
    };

    return historicalDatasets;
  }, [rawDataset, rewardsCurrency]);

  // Focused date for tooltip display and position
  const [focusedDate, setFocusedDate] = useState<string>("");

  // Initialize the chart
  const { ref: chartRef, chart } = useEcharts(echartsProps);

  // Update the chart options continuously
  useEffect(() => {
    if (!chart || !processedDatasets) return;

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
        data: processedDatasets.dailyBorrow,
        name: "Borrow",
        yAxisIndex: 0,
      },
      {
        ...getSeriesStyle("purple", false),
        data: processedDatasets.dailySupply,
        name: "Supply",
        yAxisIndex: 0,
      },
      {
        ...getSeriesStyle("orange", true),
        data: processedDatasets.dailySupplierRewards,
        name: "Supplier Rewards",
        yAxisIndex: 1,
      },
      {
        ...getSeriesStyle("red", true),
        data: processedDatasets.dailyBorrowerRewards,
        name: "Borrower Rewards",
        yAxisIndex: 1,
      },
    ];

    const maxRewards = Math.max(
      ...processedDatasets.dailySupplierRewards.map((d) => d[1]),
      ...processedDatasets.dailyBorrowerRewards.map((d) => d[1]),
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
      series: series,
    });
  }, [chart, processedDatasets]);

  return (
    <context.Provider
      value={{
        focusedDate,
        setFocusedDate,
        rewardsCurrency,
        setRewardsCurrency,
        datasets: processedDatasets,
        chartRef,
      }}
    >
      <ProtocolStatsChartView />
    </context.Provider>
  );
};
