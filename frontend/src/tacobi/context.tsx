import {
  DatasetRequest,
  DatasetRequestPending,
  ExtractDatasetIds,
  ExtractDatasetMetadata,
  ExtractDatasetRowType,
  TacoBISpec,
} from "@/tacobi/schema";
import { TacoChartProps } from "@/tacobi/chart";
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
    DatasetRequest<ExtractDatasetMetadata<S>>[]
  >([]);

  /**
   * Hook for the TacoBI context. You can import the `TacoChart` component
   * from the context and refer to all datasets within the context's spec.
   * @param ids - The ids of the datasets to fetch.
   * @returns The datasets in order of the ids.
   */
  const useDatasets = useCallback(
    <T extends ExtractDatasetIds<S>[]>(ids: [...T]) => {
      const datasets: DatasetRequest<ExtractDatasetMetadata<S>>[] = [];
      for (const dataset of datasets) {
        if (ids.includes(dataset.id)) {
          datasets.push(dataset);
        }
      }
      return datasets as OrderedDatasetRequests<S, T>;
    },
    [datasets]
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
