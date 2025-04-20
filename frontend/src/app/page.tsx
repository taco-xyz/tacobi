"use client";

import { useTacoBI } from "./tacobi-config";
import { EChart } from "@kbox-labs/react-echarts";
import * as echarts from "echarts";
import { useMemo } from "react";

export default function Home() {
  const { useDatasets, isLoading } = useTacoBI();
  const datasets = useDatasets(["bitcoin-price"]);

  if (!isLoading) {
    console.log(datasets);
  }

  return (
    <div className="grid bg-white grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="h-[500px] w-[1000px] mt-[500px]">
        <h1 className="text-xl font-semibold text-black">Bitcoin Price</h1>
        <p className="text-sm mt-1 text-gray-700">
          This is a line chart that shows the price of Bitcoin.
        </p>
        <div className="w-full h-[500px]">
          {isLoading ? (
            <div className="flex items-center size-full bg-black justify-center h-full">
              Loading...
            </div>
          ) : (
            <EChart
              textStyle={{
                fontFamily: '"Geist Mono", monospace',
              }}
              dataset={datasets}
              xAxis={{ type: "time" as const }}
              yAxis={{ type: "value" as const }}
              series={[
                {
                  type: "line" as const,
                  encode: { x: "Date", y: "Price" },
                  datasetId: "bitcoin-price",
                  lineStyle: {
                    color: "rgba(42, 129, 254, 1)",
                    width: 1,
                  },
                  showSymbol: false,
                  smooth: true,
                  sampling: "lttb",
                  // progressive: 500,
                  // progressiveThreshold: 500,
                  areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: "rgba(42, 129, 254, 0.8)" },
                      { offset: 0.5, color: "rgba(42, 129, 254, 0.4)" },
                      { offset: 1, color: "rgba(42, 129, 254, 0)" },
                    ]),
                  },
                },
              ]}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
