import {
  DatasetRequest,
  ExtractDatasetIds,
  ExtractDatasetMetadata,
  ExtractDatasetRowType,
  TacoBISpec,
} from "@/tacobi/schema";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * A type that orders the dataset requests by the ids.
 * @template S - The spec of the TacoBI context.
 * @template T - The ids of the datasets to fetch.
 */
export type OrderedDatasetRequests<
  S extends TacoBISpec,
  T extends ExtractDatasetIds<S>[]
> = [
  ...{
    [K in keyof T]: DatasetRequest<
      Extract<S["datasets"][number], { id: T[K] }>
    >;
  }
];

/**
 * Utils that can be imported from the TacoBI context.
 */
export interface TacoBIContext<S extends TacoBISpec> {
  useDatasets: <T extends ExtractDatasetIds<S>[]>(
    ids: [...T]
  ) => OrderedDatasetRequests<S, T>;
}

/**
 * Creates an empty context for the TacoBI context.
 * @returns An empty context for the TacoBI context.
 */
const createTacoBIContext = <S extends TacoBISpec>() =>
  createContext<TacoBIContext<S>>({
    useDatasets: () => {
      throw new Error("useDatasets not implemented");
    },
  });

/**
 * The internal state of the TacoBI context.
 */
interface TacoBIState<S extends TacoBISpec> {
  context: ReturnType<typeof createTacoBIContext<S>>;
  spec: S;
  url: string;
}

/**
 * Props for the creating a TacoBI application.
 * @param spec - The spec of the TacoBI context.
 * @param url - The URL of the TacoBI backend.
 */
interface createTacoBIProps<S extends TacoBISpec> {
  spec: S;
  url: string;
}

/**
 * Creates a TacoBI context within which dataset data is memoed and charts can
 * be created using those datasets.
 * @param spec - The spec of the TacoBI context.
 * @returns A state that you must pass to the provider, and a hook for
 * extracting the `TacoChart` component from the context.
 */
export const createTacoBI = <S extends TacoBISpec>({
  spec,
  url,
}: createTacoBIProps<S>) => {
  const context = createTacoBIContext<S>();

  /**
   * Hook for the TacoBI context. You can import the `TacoChart` component
   * from the context and refer to all datasets within the context's spec.
   * @returns The TacoBI context.
   */
  const useTacoBI = () => {
    return useContext(context);
  };

  return {
    state: {
      context,
      spec,
      url,
    },
    useTacoBI,
  };
};

/**
 * Utility type - a mapping of dataset ids to their requests.
 * @template S - The spec of the TacoBI context.
 */
type DatasetRequestById<S extends TacoBISpec> = {
  [K in ExtractDatasetIds<S>]: DatasetRequest<
    Extract<ExtractDatasetMetadata<S>, { id: K }>
  >;
};

/**
 * Provider for the TacoBI context. You can import the `TacoChart` component
 * from the context and refer to all datasets within the context's spec.
 * @param children - The children of the provider.
 * @param state - The state of the context.
 * @returns The provider.
 *
 * @abstract
 * The context provides the following properties:
 * - `useDatasets`: A hook that returns the datasets in order of the ids. If
 * you need to use the datasets directly to make something more customizable,
 * use this instead.
 *
 * @example
 * ```tsx
 * const { useTacoBI } = createTacoBI({
 *   spec: spec,
 *   url: "https://taco.com/api",
 * });
 *
 * const App: FC = () => { *
 *   return (
 *     <TacoBIProvider state={state}>
 *       <AppProvided />
 *     </TacoBIProvider>
 *   );
 * };
 *
 * const AppProvided: FC = () => {
 *   const { useDatasets } = useTacoBI();
 *   const [dataset1, dataset2] = useDatasets(["dataset-1", "dataset-2"]);
 * };
 * ```
 */
export const TacoBIProvider = <S extends TacoBISpec>({
  children,
  state,
}: {
  children: ReactNode;
  state: TacoBIState<S>;
}) => {
  // Cached dataset data. On page load, all datasets are fetched and cached.
  const [datasetsById, setDatasetsById] = useState<DatasetRequestById<S>>(
    () => {
      return state.spec.datasets.reduce((acc, meta) => {
        acc[meta.id as ExtractDatasetIds<S>] = {
          id: meta.id,
          state: "pending" as const,
        };
        return acc;
      }, {} as DatasetRequestById<S>);
    }
  );

  /**
   * On page load, fetch all datasets and cache them.
   * This is done using functional updates to the state to avoid race conditions.
   */
  useEffect(() => {
    // For each dataset, start by marking it as pending.
    state.spec.datasets.forEach((meta) => {
      // Fetch the dataset and update the state.
      fetch(`${state.url}${meta.route}`)
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        })
        .then((rows: ExtractDatasetRowType<(typeof meta)["dataset_schema"]>[]) => {
          // If the dataset loads successfully, mark it as loaded.
          setDatasetsById((prev) => ({
            ...prev,
            [meta.id]: {
              id: meta.id,
              state: "loaded",
              source: rows,
            },
          }));
        })
        .catch((error) => {
          // If the dataset fails to load, mark it as an error.
          setDatasetsById((prev) => ({
            ...prev,
            [meta.id]: {
              id: meta.id,
              state: "error",
              error,
            },
          }));
        });
    });
  }, [state.url, state.spec.datasets]);

  /**
   * Hook for the TacoBI context. You can import the `TacoChart` component
   * from the context and refer to all datasets within the context's spec.
   * @param ids - The ids of the datasets to fetch.
   * @returns The datasets in order of the ids.
   */
  const useDatasets = useCallback(
    <T extends ExtractDatasetIds<S>[]>(ids: [...T]) => {
      const datasets: DatasetRequest<ExtractDatasetMetadata<S>>[] = [];
      for (const id of ids) {
        const dataset = datasetsById[id];
        if (dataset) {
          datasets.push(dataset);
        }
      }
      return datasets as OrderedDatasetRequests<S, T>;
    },
    [datasetsById]
  );

  const contextValue: TacoBIContext<S> = {
    useDatasets,
  };

  return (
    <state.context.Provider value={contextValue}>
      {children}
    </state.context.Provider>
  );
};
