"use client";

import { useTacoBI } from "./tacobi-config";
import { EChart } from "@kbox-labs/react-echarts";
import * as echarts from "echarts";

// Components Imports
import KPICard from "@/components/KPICard";

export default function Home() {
  const { useDatasets, isLoading } = useTacoBI();
  const datasets = useDatasets(["bitcoin-price"]);

  return (
    <div className="flex flex-col items-center">
      <div className="grid w-full grid-cols-3 gap-6">
        <KPICard title="Total Supply" dataset={datasets[0]} />
        <KPICard title="Total Borrow" dataset={datasets[0]} />
        <KPICard title="Spare Liquidity" dataset={datasets[0]} />
      </div>

      <div className="mt-[500px] h-[500px] w-[1000px]">
        <h1 className="text-xl font-semibold text-black">Bitcoin Price</h1>
        <p className="mt-1 text-sm text-gray-700">
          This is a line chart that shows the price of Bitcoin.
        </p>
        <div className="h-[500px] w-full">
          {isLoading ? (
            <div className="flex size-full h-full items-center justify-center bg-black">
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
