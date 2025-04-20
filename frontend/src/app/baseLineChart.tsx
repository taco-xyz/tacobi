"use client";

import { EChart } from "@kbox-labs/react-echarts";
import type {
  EChartsOption,
  LineSeriesOption,
  SeriesOption,
  TooltipComponentOption,
  YAXisComponentOption,
} from "echarts";
import { useMemo } from "react";

import { chartTones } from "@/lib/colors";

import {
  baseLabelOptions,
  baseLegendOptions,
  baseTooltipOptions,
  baseXAxisCategoryOptions,
  baseYAxisValueOptions,
  type LegendOptionsWithRequiredData,
  SliderDataZoomComponentOptionWithRequiredEnd,
  type XAxisOptionsWithRequiredData,
} from "./baseChartOptions";

type SeriesOptionsWithRequiredNameAndData = {
  index: number;
  name: string;
  data: number[];
  showSymbol?: boolean;
  smooth?: boolean;
} & Partial<Omit<LineSeriesOption, "data" | "name">>;

const baseLineSeriesOptions = (
  options: SeriesOptionsWithRequiredNameAndData,
): SeriesOption => ({
  type: "line",
  symbol: "roundRect",
  symbolSize: 5,
  showSymbol: options.showSymbol ?? true,
  showAllSymbol: options.showAllSymbol ?? true,
  smooth: options.smooth ?? true,
  emphasis: {
    focus: "series",
  },
  itemStyle: {
    color: chartTones[options.index % chartTones.length],
  },
  lineStyle: {
    width: 2,
  },
  areaStyle: {
    opacity: 0.1,
  },
  animationDuration: 300,
  animationEasing: "cubicInOut" as const,
  ...options,
});

export type BaseLineChartOptionsParams = {
  tooltipOptions?: Partial<TooltipComponentOption>;
  legendOptions?: LegendOptionsWithRequiredData;
  xAxisOptions: XAxisOptionsWithRequiredData;
  yAxisOptions?: YAXisComponentOption;
  seriesOptions: SeriesOptionsWithRequiredNameAndData[];
  dataZoomOptions?: SliderDataZoomComponentOptionWithRequiredEnd;
};

const baseLineChartOptions = (
  params: BaseLineChartOptionsParams,
): EChartsOption => ({
  tooltip: baseTooltipOptions({
    axisPointer: {
      type: "line",
    },
    ...params.tooltipOptions,
  }),
  animation: true,
  animationDuration: 300,
  animationEasing: "cubicInOut" as const,
  legend: params.legendOptions
    ? baseLegendOptions(params.legendOptions)
    : undefined,
  grid: {
    left: 30,
    right: 30,
    top: params.legendOptions ? 40 : 20,
    bottom: 60,
    containLabel: true,
  },
  xAxis: baseXAxisCategoryOptions(params.xAxisOptions),
  yAxis: baseYAxisValueOptions({
    axisLabel: {
      ...baseLabelOptions(),
      formatter: (value: number) => value.toFixed(2),
    },
    ...params.yAxisOptions,
  }),
  series: params.seriesOptions?.map(baseLineSeriesOptions),
  dataZoom: params.dataZoomOptions,
});

type BaseLineChartProps = {
  chartOptions: BaseLineChartOptionsParams;
  style?: React.CSSProperties;
  opts?: Record<string, string | number | boolean | object>;
};

export const BaseLineChart = ({
  chartOptions,
  style,
  opts,
}: BaseLineChartProps) => {
  const options = useMemo(() => {
    return baseLineChartOptions(chartOptions);
  }, [chartOptions]);

  return (
    <EChart
      {...options}
      key={JSON.stringify(options)}
      style={{
        height: "clamp(300px, 50vh, 480px)",
        width: "99%",
        margin: "0 auto",
        ...style,
      }}
      opts={{
        renderer: "canvas",
        throttle: 50,
        lazyUpdate: true,
        progressive: 500,
        progressiveThreshold: 3000,
        theme: "dark",
        backgroundColor: "transparent",
        ...opts,
      }}
    />
  );
};
