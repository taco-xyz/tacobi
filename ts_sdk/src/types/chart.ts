import {
  ExtractDatasetColumnNames,
  ExtractDatasetIds,
  TacoBISpec,
} from "@/types/schema";
import { EChartProps } from "@kbox-labs/react-echarts";
import { EChartsOption, SeriesOption } from "echarts";
import { Resolve } from "@/types/utils/resolve";

/**
 * Series option that can only accept dataset IDs contained within TacoBISchema.
 * @template S - The TacoBISpec.
 * @template ID - The ID of the dataset being referenced.
 *
 * Extends the ECharts `SeriesOption` type, forcing a `datasetId` valid within
 * the spec to be specified. Also enforces that the `encode` property values
 * are all valid header names of the dataset specified by `datasetId`.
 *
 * For examples on how to use, see the
 * [ECharts Series API](https://echarts.apache.org/en/option.html#series).
 */
export type TacoSeriesOption<S extends TacoBISpec> = {
  [K in ExtractDatasetIds<S>]: SeriesOption & {
    datasetId: K;
    encode: {
      [coordDim: string]:
        | ExtractDatasetColumnNames<S, K>
        | ExtractDatasetColumnNames<S, K>[];
    };
  };
}[ExtractDatasetIds<S>];

/**
 * ECharts props that can only accept dataset IDs contained within TacoBISchema.
 * @warning Do not specify the dataset property in options. Use datasetId in series instead.
 */
export type EChartPropsOmitDataset<S extends TacoBISpec> = Omit<
  EChartProps,
  "options"
> & {
  options: Array<
    Omit<EChartsOption, "dataset"> & {
      series: Array<TacoSeriesOption<S>>;
    } & {
      dataset?: never; // Explicitly forbid dataset property
    }
  >;
};

/**
 * ECharts props that can only accept dataset IDs contained within TacoBISchema.
 * @warning Do not specify the dataset property in options. Use datasetId in series instead.
 */
export type TacoChartProps<S extends TacoBISpec> = Resolve<
  EChartPropsOmitDataset<S>
>;
