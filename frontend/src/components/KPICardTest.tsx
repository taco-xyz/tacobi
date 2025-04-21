"use client";

// React Imports
import { useEffect, useMemo } from "react";

// Custom Hooks Imports
import { useEcharts, useEchartsProps } from "@/hooks/useEcharts";

// Echarts Imports
import * as echarts from "echarts";

const TestChart = () => {
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

  useEffect(() => {
    if (!chart) return;

    // Generate random data
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).getTime(),
      value: Math.random() * 1000 + 500,
    }));

    // Replicate KPICard styling
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
          data: data.map((item) => [item.date, item.value]),
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

    // Fix overflow for point markers
    console.log(chart);
    const wrapper = chart.getDom()?.querySelector("div");
    const svg = chart.getDom()?.querySelector("svg");
    if (wrapper && svg) {
      wrapper.style.overflow = "visible";
      svg.style.overflow = "visible";
    }
  }, [chart]);

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200">
      <div className="flex w-full flex-col items-center gap-y-1">
        <h1 className="w-full text-start text-sm font-normal text-gray-500">
          Test Chart
        </h1>
        <div className="flex h-[28px] w-full flex-row items-center justify-between">
          <p className="font-geist-mono text-lg font-semibold text-gray-700">
            1,234.56
          </p>
          <p className="text-sm text-gray-500">Jan 30</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-y-2.5">
        <div ref={ref} className="h-16 w-full overflow-visible" />
        <div className="flex h-[16px] w-full flex-row items-center justify-between">
          <p className="text-xs text-gray-500">Jan 1</p>
          <p className="text-xs text-gray-500">Jan 30</p>
        </div>
      </div>
    </div>
  );
};

export default TestChart;
