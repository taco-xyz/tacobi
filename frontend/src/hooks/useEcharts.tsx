"use client";

// React Imports
import { useEffect, useRef, useState } from "react";

// Echarts Imports
import * as echarts from "echarts";

/**
 * @description The options for initializing the echarts instance
 * @param initOpts - The options for initializing the echarts instance
 * @param theme - Optional theme for the echarts instance
 */
export interface useEchartsProps {
  initOpts: echarts.EChartsInitOpts;
  theme?: Parameters<typeof echarts.init>[1];
}

/**
 * @description Hook for initializing an echarts instance
 * @param initOpts - The options for initializing the echarts instance
 * @param theme - Optional theme for the echarts instance
 * @returns The chart instance and the ref to the chart container
 *
 * @example
 * const { ref, chart } = useEcharts({
 *   initOpts: {
 *     width: 400,
 *     height: 400,
 *   },
 * });
 */
export const useEcharts = ({ initOpts, theme }: useEchartsProps) => {
  // Initialize ref and chart state
  const ref = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Initialize chart and store the instance
    const chartInstance = echarts.init(ref.current, theme, initOpts);
    setChart(chartInstance);

    // Setup resize observer
    const resizeObserver = new ResizeObserver(() => {
      chartInstance.resize();
    });
    resizeObserver.observe(ref.current);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      chartInstance.dispose();
    };
  }, [initOpts, theme]);

  return {
    ref,
    chart,
  };
};
