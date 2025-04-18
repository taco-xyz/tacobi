import { TacoBISpec } from "./types/schema";
import { TacoBIProvider, createTacoBI } from "./context";

const testDataset = {
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
  ],
} as const satisfies TacoBISpec;

const { useTacoBI, state } = createTacoBI({
  spec: testDataset,
  url: "http://localhost:3000",
});

const AppProvider = () => {
  return (
    <TacoBIProvider state={state}>
      <App />
    </TacoBIProvider>
  );
};

const App = () => {
  const { TacoChart } = useTacoBI();
  return (
    <TacoChart
      options={[
        {
          series: [
            {
              datasetId: "dataset-1",
              type: "bar",
              encode: {
                x: "Beverage",
                y: ""
              },
            },
          ],
        },
      ]}
    />
  );
};
