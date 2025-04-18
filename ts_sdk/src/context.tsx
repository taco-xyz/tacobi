import { TacoBISpec } from "@/types/schema";
import { TacoChartProps } from "@/types/chart";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
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
  });

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
 * Creates a TacoBI context within which dataset data is memoed and charts
 * can be created using those datasets.
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
 */
export const TacoBIProvider = <S extends TacoBISpec>({
  children,
  state,
}: {
  children: ReactNode;
  state: {
    spec: S;
    context: ReturnType<typeof createTacoBIContext<S>>;
  };
}) => {
  /**
   * Cached dataset data.
   * TODO - Fetch all of these on page load.
   */
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);

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
  };

  return (
    <state.context.Provider value={contextValue}>
      {children}
    </state.context.Provider>
  );
};
