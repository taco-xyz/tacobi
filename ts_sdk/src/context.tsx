import {
  Dataset,
  DatasetLoaded,
  DatasetLoading,
  ExtractDatasetIds,
  ExtractDatasetSchemas,
  TacoBISpec,
} from "@/types/schema";
import { TacoChartProps } from "@/types/chart";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EChart } from "@kbox-labs/react-echarts";
import { DatasetOption } from "echarts/types/dist/shared";

/**
 * Utils that can be imported from the TacoBI context.
 */
export interface TacoBIContext<S extends TacoBISpec> {
  TacoChart: FC<TacoChartProps<S>>;
  useDatasets: <T extends ExtractDatasetIds<S>[]>(
    ids: [...T]
  ) => {
    [K in keyof T]: Dataset<
      Extract<S["datasets"][number], { id: T[K] }>["dataset_schema"]
    >;
  };
}

/**
 * Creates an empty context for the TacoBI context.
 * @returns An empty context for the TacoBI context.
 */
const createTacoBIContext = <S extends TacoBISpec>() =>
  createContext<TacoBIContext<S>>({
    TacoChart: () => {
      throw new Error("TacoChart not implemented");
    },
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
 * Generates a TacoChart component with all the datasets already populated.
 * @param options - The options of the TacoChart.
 * @param datasets - The datasets of the TacoChart.
 * @returns The TacoChart component.
 */
const PopulatedTacoChart = <S extends TacoBISpec>({
  options,
  datasets,
}: TacoChartProps<S> & { datasets: DatasetOption[] }) => {
  const populatedOptions = useMemo(() => {
    return options.map((option) => ({
      ...option,
      dataset: datasets,
    }));
  }, [options, datasets]);

  return <EChart options={populatedOptions} />;
};

/**
 * Provider for the TacoBI context. You can import the `TacoChart` component
 * from the context and refer to all datasets within the context's spec.
 * @param children - The children of the provider.
 * @param state - The state of the context.
 * @returns The provider.
 *
 * @abstract
 * The context provides multiple properties:
 * - `TacoChart`: A component that renders a chart. This component is based on
 * ECharts and automatically memoizes datasets as you use them in series, so
 * you do NOT need to manually fetch them.
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
 *   const { TacoChart, useDatasets } = useTacoBI();
 *
 *   return (
 *     <TacoChart />
 *   );
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
  const [datasets, setDatasets] = useState<
    (DatasetLoaded<ExtractDatasetSchemas<S>> & { id: string })[]
  >([]);

  useEffect(() => {
    const fetchAllDatasets = async () => {
      try {
        // Fetch all datasets from the TacoBI backend.
        const datasetPromises = state.spec.datasets.map(async (dataset) => {
          // Fetch
          const response = await fetch(`${state.url}${dataset.route}`);

          // Parse the response as JSON
          const data = await response.json();
          const loadedDataset: DatasetLoaded<
            (typeof dataset)["dataset_schema"]
          > = {
            isLoading: false,
            data: data,
          };

          return {
            ...loadedDataset,
            id: dataset.id,
          };
        });

        // Wait for all datasets to be fetched
        const fetchedDatasets = await Promise.all(datasetPromises);

        // Update state with new datasets
        setDatasets(fetchedDatasets);
      } catch (error) {
        console.error("Failed to fetch datasets:", error);
      }
    };

    fetchAllDatasets();
  }, [state.spec.datasets, state.url]);

  /**
   * Hook for the TacoBI context. You can import the `TacoChart` component
   * from the context and refer to all datasets within the context's spec.
   * @param ids - The ids of the datasets to fetch.
   * @returns The datasets in order of the ids.
   */
  const useDatasets = useCallback(
    <T extends ExtractDatasetIds<S>[]>(ids: [...T]) => {
      if (datasets.length === 0) {
        return ids.map(() => ({ isLoading: true })) as {
          [K in keyof T]: DatasetLoading;
        };
      }

      const returnedDatasets: DatasetLoaded<ExtractDatasetSchemas<S>>[] = [];
      for (const id of ids) {
        const dataset = datasets.find((dataset) => dataset.id === id);
        if (dataset === undefined) {
          throw new Error(
            `Dataset with id ${id} not found, do you have type checking enabled?`
          );
        } else {
          returnedDatasets.push(dataset);
        }
      }
      return returnedDatasets as {
        [K in keyof T]: DatasetLoaded<ExtractDatasetSchemas<S>>;
      };
    },
    [datasets]
  );

  /**
   * Memoized TacoChart component with all the datasets already populated.
   * Must be regenerated every time the datasets change.
   */
  const TacoChart = useCallback(
    (props: TacoChartProps<S>) => {
      return <PopulatedTacoChart {...props} datasets={datasets} />;
    },
    [datasets]
  );

  const contextValue: TacoBIContext<S> = {
    TacoChart,
    useDatasets,
  };

  return (
    <state.context.Provider value={contextValue}>
      {children}
    </state.context.Provider>
  );
};
