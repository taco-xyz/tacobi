"use client";

import { EChartsOption, init as echartsInit } from "echarts";
import { useEffect, useRef, useState } from "react";

const BASE_URL = "http://127.0.0.1:8000";

type DrinksValues = [
  "drink",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "price",
  "color"
];

type EChartsValue = number | string;

type TacoBIResponse = {
  headers: string[];
  values: EChartsValue[][];
};

const LineChart = () => {
  const [data, setData] = useState<EChartsValue[][] | undefined>();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${BASE_URL}/drinks`);
      const data: TacoBIResponse = await response.json();

      setData([data.headers, ...data.values]);
    };
    fetchData();
  }, []);

  console.log(`Data: ${JSON.stringify(data)}`);

  useEffect(() => {
    if (!data) return;

    const option: EChartsOption = {
      grid: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 60,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
      dataset: {
        source: data,
      },
      series: [
        {
          type: "bar",
          encode: {
            x: "asdaosdk",
            y: 1,
          },
          label: {
            show: true,
            position: "top",
          },
        },
      ],
    };

    if (chartRef.current) {
      const myChart = echartsInit(chartRef.current);
      myChart.setOption(option);

      // Handle window resize
      window.addEventListener("resize", () => myChart.resize());
      return () => window.removeEventListener("resize", () => myChart.resize());
    }
  }, [data]);

  return <div ref={chartRef} className="w-full h-[600px]" />;
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <LineChart />
    </div>
  );
}
