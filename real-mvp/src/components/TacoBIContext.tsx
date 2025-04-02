import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Schema, DatasetMetadata, Dataset } from "@/types/schema";
import { FetchDatasetFn } from "@/types/fetchDataset";

/**
 * Default implementation of the FetchDatasetFn interface.
 * This function fetches a dataset from the server based on the provided metadata.
 *
 * @param dataset_metadata - The metadata of the dataset to fetch.
 * @returns A promise that resolves to the dataset.
 */
export const defaultFetchDataset = async <D extends DatasetMetadata>(
  dataset_metadata: D
) => {
  try {
    const response = await fetch(`/api${dataset_metadata.route}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Dataset<D["dataset_schema"]>; // TODO FIXME - Use Zod to parse the response instead of lazy casting.
  } catch (error) {
    console.error("Error fetching dataset:", error);
    throw error;
  }
};

type TacoBIContextType<S extends Schema> = {
  getDataset: <D extends S["datasets"][number]>(
    datasetId: D["id"]
  ) => Promise<Dataset<D["dataset_schema"]>>;
};

const createTacoBIContext = <S extends Schema>() =>
  createContext<TacoBIContextType<S>>({
    getDataset: async () => {
      throw new Error("getDataset not implemented");
    },
  });

export const createTacoBI = <S extends Schema>(schema: S) => {
  const context = createTacoBIContext<S>();

  const useTacoBI = () => {
    return useContext(context);
  };

  return {
    state: {
      context,
      schema,
    },
    useTacoBI,
  };
};

const TacoBIProvider = <S extends Schema>({
  children,
  state,
  fetch_dataset = defaultFetchDataset,
}: {
  children: ReactNode;
  state: {
    schema: S;
    context: ReturnType<typeof createTacoBIContext<S>>;
  };
  fetch_dataset?: FetchDatasetFn<S["datasets"][number]>;
}) => {
  /**
   * Based on the specified dataset ID, calls fetchDataset with the dataset metadata.
   *
   * @param datasetId - The ID of the dataset to fetch.
   * @returns A promise that resolves to the dataset.
   */
  const getDataset = useCallback(
    async <D extends S["datasets"][number]>(datasetId: D["id"]) => {
      // Get the metadata of the dataset by its ID
      const datasetMetadata = state.schema.datasets.find(
        (dataset) => dataset.id === datasetId
      ) as D;

      // Fetch the dataset based on its metadata (which we use for getting the route and for validating the dataset schema)
      const dataset = await fetch_dataset(datasetMetadata);

      // Return the dataset with the correct type
      return dataset as Dataset<D["dataset_schema"]>;
    },
    [fetch_dataset, state.schema]
  );

  return (
    <state.context.Provider value={{ getDataset }}>
      {children}
    </state.context.Provider>
  );
  /**
   * TODO
   * 1. Add a useDatasets hook to the context and, without using the state, just do the fetch.
   * 1.1. Add caching using datasets in the state
   * 1.2. Add request coalescing/deduplication using [idk yet]
   *
   */
};

// EXAMPLE USAGE _________________________________________________________________________________________

const jsonSchema = {
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
} as const satisfies Schema;

const { useTacoBI, state } = createTacoBI(jsonSchema);

const App: FC<{ children?: ReactNode }> = ({ children }) => {
  return <TacoBIProvider state={state}>{children}</TacoBIProvider>;
};

export const AppProvided: FC = () => {
  const { getDataset } = useTacoBI();

  const dataset = useMemo(() => getDataset("dataset-3"), [getDataset]);

  return (
    <App>
      <div>Hello</div>
    </App>
  );
};
