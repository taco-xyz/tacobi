import { useTacoBI, state } from "@/context/myTacoBIContext";
import { Dataset, GetDatasetMetadata } from "@/types/schema";
import { EChart } from "@kbox-labs/react-echarts";
import { useEffect, useState } from "react";

type Dataset1Schema = GetDatasetMetadata<
  typeof state.spec,
  "dataset-1"
>["dataset_schema"];
type Dataset1 = Dataset<Dataset1Schema>;

export default function Home() {
  const { getDataset } = useTacoBI();

  const [dataset, setDataset] = useState<Dataset1 | null>(null);

  useEffect(() => {
    getDataset("dataset-1").then(setDataset);
  }, [getDataset]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {dataset && (
        <EChart
          option={{
            dataset: {
              source: [dataset.headerNames, ...dataset.rows],
            },
            series: [
              {
                type: "line",
                x: "Day",
                y: "Sales",
              },
            ],
          }}
        />
      )}
    </div>
  );
}
