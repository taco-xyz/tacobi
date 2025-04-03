import { TacoBISpec } from "@/types/schema";
import { createTacoBI } from "@/context/TacoBIContext";

const tacoBISpec = {
  datasets: [
    {
      id: "dataset-1",
      route: "/dataset-1",
      type: "tabular",
      dataset_schema: {
        columns: [
          {
            name: "Day",
            valueType: "string",
          },
          {
            name: "Week",
            valueType: "number",
          },
        ],
      },
    },
    {
      id: "dataset-2",
      route: "/dataset-1",
      type: "tabular",
      dataset_schema: {
        columns: [
          {
            name: "Day",
            valueType: "string",
          },
        ],
      },
    },
  ],
} as const satisfies TacoBISpec;

export const { useTacoBI, state } = createTacoBI(tacoBISpec);
