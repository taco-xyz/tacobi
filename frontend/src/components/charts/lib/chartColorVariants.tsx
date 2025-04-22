import * as echarts from "echarts";

/**
 * Properties for the chart color variant.
 * @property areaStyle - The styling for the area of the chart.
 * @property lineStyle - The styling for the line of the chart.
 * @property color - The color of the chart.
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
  color: string;
}
/**
 * Available chart color variants.
 */
export type ChartColorVariant = "blue" | "purple" | "orange" | "red";

/**
 * Mapping of chart color variants to their respective styling properties.
 */
const chartColorVariants: Record<ChartColorVariant, ChartColorVariantProps> = {
  blue: {
    areaStyle: {
      opacity: 0.8,
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(219, 232, 253, 1)" },
        { offset: 0.5, color: "rgba(219, 232, 253, 0.75)" },
        { offset: 1, color: "rgba(219, 232, 253, 0)" },
      ]),
    },
    lineStyle: { color: "rgba(59, 130, 246, 1)", width: 1.5 },
    color: "rgba(59, 130, 246, 1)",
  },
  purple: {
    areaStyle: {
      opacity: 0.8,
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(219, 232, 253, 1)" },
        { offset: 0.5, color: "rgba(219, 232, 253, 0.75)" },
        { offset: 1, color: "rgba(219, 232, 253, 0)" },
      ]),
    },
    lineStyle: { color: "rgba(168, 85, 247, 1)", width: 1.5 },
    color: "rgba(168, 85, 247, 1)",
  },
  orange: {
    areaStyle: {
      opacity: 0.8,
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(254, 235, 200, 1)" },
        { offset: 0.5, color: "rgba(254, 235, 200, 0.75)" },
        { offset: 1, color: "rgba(254, 235, 200, 0)" },
      ]),
    },
    lineStyle: { color: "rgba(249, 115, 22, 1)", width: 1.5 },
    color: "rgba(249, 115, 22, 1)",
  },
  red: {
    areaStyle: {
      opacity: 0.8,
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(254, 226, 226, 1)" },
        { offset: 0.5, color: "rgba(254, 226, 226, 0.85)" },
        { offset: 1, color: "rgba(254, 226, 226, 0)" },
      ]),
    },
    lineStyle: { color: "rgba(239, 68, 68, 1)", width: 1.5 },
    color: "rgba(239, 68, 68, 1)",
  },
};

/**
 * Get the chart color variant
 * @param variant - The variant to get the color for
 * @returns The chart color variant
 */
export function getChartColorVariant(variant: ChartColorVariant) {
  return chartColorVariants[variant];
}
