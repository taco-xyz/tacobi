import { createContext, ReactNode, useCallback, useContext } from "react";
import { TacoBISpec, DatasetMetadata, Dataset } from "@/types/schema";
import { FetchDatasetFn } from "@/types/fetchDataset";

/**
 * Default implementation of the FetchDatasetFn interface.
 * This function fetches a dataset from the server based on the provided metadata.
 *
 * @param dataset_metadata - The metadata of the dataset to fetch.
 * @returns A promise that resolves to the dataset.
 */
const defaultFetchDataset = async <D extends DatasetMetadata>(
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

export type TacoBIContextType<S extends TacoBISpec> = {
  getDataset: <ID extends S["datasets"][number]["id"]>(
    datasetId: ID
  ) => Promise<
    Dataset<Extract<S["datasets"][number], { id: ID }>["dataset_schema"]>
  >;
};

const createTacoBIContext = <S extends TacoBISpec>() =>
  createContext<TacoBIContextType<S>>({
    getDataset: async () => {
      throw new Error("getDataset not implemented");
    },
  });

export const createTacoBI = <S extends TacoBISpec>(spec: S) => {
  const context = createTacoBIContext<S>();

  const useTacoBI = () => {
    return useContext(context);
  };

  return {
    state: {
      context,
      spec,
    },
    useTacoBI,
  };
};

export const TacoBIProvider = <S extends TacoBISpec>({
  children,
  state,
  fetch_dataset = defaultFetchDataset,
}: {
  children: ReactNode;
  state: {
    spec: S;
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
      const datasetMetadata = state.spec.datasets.find(
        (dataset) => dataset.id === datasetId
      ) as D;

      // Fetch the dataset based on its metadata (which we use for getting the route and for validating the dataset schema)
      const dataset = await fetch_dataset(datasetMetadata);

      // Return the dataset with the correct type
      return dataset as Dataset<D["dataset_schema"]>;
    },
    [fetch_dataset, state.spec]
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
