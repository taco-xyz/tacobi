import type {
  LegendComponentOption,
  SliderDataZoomComponentOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from "echarts";
import { TopLevelFormatterParams } from "echarts/types/dist/shared";
// @ts-ignore
import merge from "lodash/merge";

import { currencyFormatter } from "@/lib/formatters";

// echarts doesn't export the LabelOption type, so we need to define it ourselves
type LabelOption = NonNullable<LegendComponentOption["selectorLabel"]>;

export const baseLabelOptions = (options?: LabelOption) =>
  merge(
    {
      fontFamily: '"Geist Mono", "Geist Mono Fallback"',
      fontSize: 12,
      color: "#d0d0d0",
    },
    options || {}
  ) satisfies LabelOption;

export const baseTooltipOptions = (options?: Partial<TooltipComponentOption>) =>
  merge(
    {
      trigger: "axis",
      axisPointer: {
        type: "none",
      },
      enterable: false,
      confine: true,
      textStyle: baseLabelOptions(),
      backgroundColor: "#161616",
      borderColor: "#404040",
      borderWidth: 1,
      borderRadius: 0,
      formatter: (params: TopLevelFormatterParams) => {
        if (!Array.isArray(params)) {
          return "";
        }

        const nameGap = params[0].name;
        let tooltipContent = `${nameGap}<br/>`;
        let total = 0;

        params.forEach((param) => {
          const value = Number(param.value) || 0;
          total += value;
          if (value > 0) {
            tooltipContent += `${param.marker} ${
              param.seriesName
            }: ${currencyFormatter.format(value)}<br/>`;
          }
        });

        tooltipContent += `<br/>Total: ${currencyFormatter.format(total)}`;
        return tooltipContent;
      },
    },
    options || {}
  ) satisfies TooltipComponentOption;

export type LegendOptionsWithRequiredData = {
  data: NonNullable<LegendComponentOption["data"]>;
} & Partial<Omit<LegendComponentOption, "data">>;

export const baseLegendOptions = (options: LegendOptionsWithRequiredData) =>
  merge(
    {
      itemWidth: 10,
      itemHeight: 10,
      padding: [0, 30, 0, 30],
      type: "scroll",
      pageButtonGap: 10,
      pageIcons: {
        horizontal: [
          "path://M16 20L9.5 13.5L16 7C16.4 6.6 16.4 6 16 5.6C15.6 5.2 15 5.2 14.6 5.6L7.3 12.9C6.9 13.3 6.9 13.9 7.3 14.3L14.6 21.6C15 22 15.6 22 16 21.6C16.4 21.2 16.4 20.6 16 20Z",
          "path://M8 4L14.5 10.5L8 17C7.6 17.4 7.6 18 8 18.4C8.4 18.8 9 18.8 9.4 18.4L16.7 11.1C17.1 10.7 17.1 10.1 16.7 9.7L9.4 2.4C9 2 8.4 2 8 2.4C7.6 2.8 7.6 3.4 8 4Z",
        ],
      },
      pageIconColor: "#f0f0f0",
      pageIconInactiveColor: "#606060",
      pageIconSize: 12,
      borderRadius: 0,
      pageTextStyle: baseLabelOptions(),
      textStyle: baseLabelOptions({ color: "inherit" }),
    },
    options
  ) satisfies LegendComponentOption;

export type XAxisOptionsWithRequiredData = {
  data: string[];
} & Partial<Omit<XAXisComponentOption, "data" | "type">>;

export const baseXAxisCategoryOptions = (
  options: XAxisOptionsWithRequiredData
) =>
  merge(
    {
      type: "category" as const,
      axisLabel: merge(
        baseLabelOptions({
          rotate: 0,
          overflow: "break",
          width: 100,
        }),
        { interval: 0 }
      ),
      axisLine: {
        lineStyle: {
          color: "#606060",
        },
      },
    },
    options
  ) satisfies XAXisComponentOption;

export const baseYAxisValueOptions = (
  options?: Partial<Omit<YAXisComponentOption, "type">>
) =>
  merge(
    {
      type: "value" as const,
      nameLocation: "middle",
      nameGap: 45,
      nameTextStyle: baseLabelOptions({ padding: [0, 0, 10, 0] }),
      axisLabel: merge(baseLabelOptions(), {
        formatter: (value: number) => {
          return currencyFormatter.format(value);
        },
      }),
      axisLine: {
        lineStyle: {
          color: "#606060",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#404040",
        },
      },
    },
    options || {}
  ) satisfies YAXisComponentOption;

export type SliderDataZoomComponentOptionWithRequiredEnd = {
  end: number;
} & Partial<Omit<SliderDataZoomComponentOption, "end">>;

export const baseSliderDataZoomOptions = (
  options: SliderDataZoomComponentOptionWithRequiredEnd
) => {
  const baseOptions = {
    type: "slider",
    start: 0,
    moveHandleSize: 10,
    moveHandleStyle: {
      color: "#C0FD5C",
      opacity: 0.3,
    },
    handleStyle: {
      color: "#85b140",
      borderColor: "#85b140",
      borderRadius: 0,
    },
    borderColor: "#C0FD5C44",
    borderRadius: 0,
    showDetail: false,
    moveHandleIcon: "path://",
    bottom: 20,
    emphasis: {
      moveHandleStyle: {
        color: "#C0FD5C",
        opacity: 1,
      },
      handleLabel: {
        show: false,
      },
      handleStyle: {
        color: "#C0FD5C",
        borderColor: "#C0FD5C",
      },
    },
    backgroundColor: "#161616",
    fillerColor: "rgba(192, 253, 92, 0.1)",
    selectedDataBackground: {
      lineStyle: {
        color: "#C0FD5C",
        opacity: 0.5,
      },
      areaStyle: {
        color: "#C0FD5C",
        opacity: 0.25,
      },
    },
    dataBackground: {
      lineStyle: {
        color: "#C0FD5C",
        opacity: 0.1,
      },
      areaStyle: {
        color: "#C0FD5C",
        opacity: 0.05,
      },
    },
  };

  return merge(baseOptions, options) satisfies SliderDataZoomComponentOption;
};

export const baseSliderDataZoomAsScrollbarOptions = (
  options: SliderDataZoomComponentOptionWithRequiredEnd
): SliderDataZoomComponentOption =>
  merge(
    baseSliderDataZoomOptions({
      zoomLock: true,
      height: 0,
      showDetail: false,
      borderColor: "rgba(255,255,255,0)",
      end: options.end,
    }),
    options
  );

export const baseAxisLabelAsMonthYearOptions =
  (): XAXisComponentOption["axisLabel"] => ({
    ...baseLabelOptions(),
    interval: (_index: number, value: string) => {
      const date = value.split("/");
      return date[0] === "01";
    },
    formatter: (value: string) => {
      const [, month, year] = value.split("/");
      return `${month}/${year}`;
    },
  });

export type ConcentrationIndicatorChartParams = {
  data: Array<{ timestamp: string; value: number }>;
  indicatorName: string;
  seriesName: string;
};

export const baseConcentrationIndicatorChartOptions = ({
  data,
  indicatorName,
  seriesName,
}: ConcentrationIndicatorChartParams) => ({
  tooltipOptions: {
    formatter: (params: TopLevelFormatterParams) => {
      const paramData = Array.isArray(params) ? params[0] : params;

      return `
          <div class="flex flex-col gap-2 min-w-52">
            <span class="text-sm font-medium">${
              data[paramData.dataIndex].timestamp
            }</span>
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#BFEA81]"></span>
              <span class="text-sm">${seriesName}</span>
              <span class="ml-auto font-medium">${Number(
                paramData.value
              ).toFixed(2)}</span>
            </div>
          </div>
        `;
    },
  },
  xAxisOptions: {
    type: "category" as const,
    data: data.map((d) => d.timestamp),
    axisLabel: baseAxisLabelAsMonthYearOptions(),
  },
  yAxisOptions: {
    min: 0,
    max: 1,
    name: indicatorName,
  },
  seriesOptions: [
    {
      name: seriesName,
      index: 0,
      data: data.map((d) => d.value),
    },
  ],
  dataZoomOptions: baseSliderDataZoomOptions({
    end: 100,
    bottom: 15,
  }),
});
