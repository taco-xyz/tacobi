// ECharts Imports
import * as echarts from "echarts";

// Context Imports
import { Theme } from "@/hooks/useTheme";

/**
 * Properties for the chart color variant.
 * @property areaStyle - The styling for the area of the chart.
 * @property lineStyle - The styling for the line of the chart.
 * @property itemStyle - The styling for the data points of the chart.
 */
export interface ChartColorVariantProps {
  areaStyle: {
    opacity: number;
    color: echarts.graphic.LinearGradient;
  };
  lineStyle: {
    color: string;
    width: number;
  };
  itemStyle: {
    color: string;
    borderColor: string;
    borderWidth: number;
    backgroundTwColor: string;
  };
}

/**
 * Available chart color variants.
 */
export type ChartColorVariant = "blue" | "purple" | "orange" | "red";

/**
 * Create a color variant
 * @param theme - The theme to create the color variant for
 * @param props - The properties of the color variant
 * @returns The color variant
 */
const createColorVariant = (
  theme: Theme,
  {
    areaStart,
    areaEnd,
    line,
    backgroundTwColor,
  }: {
    areaStart: string;
    areaEnd: string;
    line: string;
    backgroundTwColor: string;
  },
): ChartColorVariantProps => ({
  areaStyle: {
    opacity: 0.8,
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: areaStart },
      { offset: 1, color: areaEnd },
    ]),
  },
  lineStyle: {
    color: line,
    width: 1.5,
  },
  itemStyle: {
    color: theme === "light" ? "#ffffff" : "#030712",
    borderColor: line,
    borderWidth: 2,
    backgroundTwColor: backgroundTwColor,
  },
});

/**
 * The chart color variants
 */
const chartColorVariants: Record<
  ChartColorVariant,
  Record<Theme, ChartColorVariantProps>
> = {
  blue: {
    light: createColorVariant("light", {
      areaStart: "rgba(96, 165, 250, 1)",
      areaEnd: "rgba(147, 197, 253, 0)",
      line: "#3b82f6",
      backgroundTwColor: "bg-blue-500",
    }),
    dark: createColorVariant("dark", {
      areaStart: "rgba(30, 64, 175, 1)",
      areaEnd: "rgba(30, 58, 138, 0)",
      line: "#3b82f6",
      backgroundTwColor: "bg-blue-500",
    }),
  },
  purple: {
    light: createColorVariant("light", {
      areaStart: "rgba(216, 180, 254, 1)",
      areaEnd: "rgba(243, 232, 255, 0)",
      line: "#a855f7",
      backgroundTwColor: "bg-purple-500",
    }),
    dark: createColorVariant("dark", {
      areaStart: "rgba(126, 34, 206, 1)",
      areaEnd: "rgba(88, 28, 135, 0)",
      line: "#a855f7",
      backgroundTwColor: "bg-purple-500",
    }),
  },
  orange: {
    light: createColorVariant("light", {
      areaStart: "rgba(253, 186, 116, 1)",
      areaEnd: "rgba(255, 237, 213, 0)",
      line: "#f97316",
      backgroundTwColor: "bg-orange-500",
    }),
    dark: createColorVariant("dark", {
      areaStart: "rgba(194, 65, 12, 1)",
      areaEnd: "rgba(124, 45, 18, 0)",
      line: "#f97316",
      backgroundTwColor: "bg-orange-500",
    }),
  },
  red: {
    light: createColorVariant("light", {
      areaStart: "rgba(252, 165, 165, 1)",
      areaEnd: "rgba(254, 226, 226, 0)",
      line: "#ef4444",
      backgroundTwColor: "bg-red-500",
    }),
    dark: createColorVariant("dark", {
      areaStart: "rgba(185, 28, 28, 1)",
      areaEnd: "rgba(127, 29, 29, 0)",
      line: "#ef4444",
      backgroundTwColor: "bg-red-500",
    }),
  },
};

/**
 * Get the chart color variant
 * @param variant - The variant to get the color for
 * @param theme - The theme to get the color for
 * @returns The chart color variant
 */
export function getChartColorVariant(
  variant: ChartColorVariant,
  theme: Theme,
): ChartColorVariantProps {
  return chartColorVariants[variant][theme];
}
