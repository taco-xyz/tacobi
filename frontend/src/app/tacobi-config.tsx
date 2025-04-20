import { createTacoBI } from "@/tacobi";
import type { TacoBISpec } from "@/tacobi";

const spec = {
  datasets: [
    {
      id: "dataset-1",
      route: "/dataset-1",
      dataset_schema: {
        columns: [
          { name: "Beverage", valueType: "string" },
          { name: "Price", valueType: "number" },
        ],
      },
    },
    {
      id: "dataset-2",
      route: "/dataset-2",
      dataset_schema: {
        columns: [{ name: "Cocktail", valueType: "string" }],
      },
    },
    {
      id: "bitcoin-price",
      route: "/bitcoin-price",
      dataset_schema: {
        columns: [
          { name: "Date", valueType: "string" },
          { name: "Price", valueType: "number" },
        ],
      },
    },
  ],
} as const satisfies TacoBISpec;

const { state, useTacoBI } = createTacoBI({
  spec,
  url: "http://localhost:8000",
});

export { state, useTacoBI };
