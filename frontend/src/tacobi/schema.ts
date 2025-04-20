import { Resolve } from "./utils/resolve";

/**
 * The type of the value in a column. These are based on the valid
 * ECharts types.
 */
export type ColumnValue = "string" | "number";

/**
 * Column schema, containing a name and type of the value in each row.
 * @property name - The name of the column.
 * @property valueType - The type of the value in the column.
 */
export interface ColumnSchema {
  name: string;
  valueType: ColumnValue;
}

export type SelectColumnValue<T extends ColumnValue> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : never;

/**
 * Dataset schema, containing a list of headers defining the name and type of
 * the value in each row.
 * @property columns - The columns of the dataset.
 */
export interface DatasetSchema {
  columns: ColumnSchema[];
}

/**
 * Utility type to extract the row type of a dataset.
 * @param S - The dataset schema.
 * @returns The row type of the dataset.
 */
export type ExtractDatasetRowType<S extends DatasetSchema> = {
  [C in S["columns"][number] as C["name"]]: SelectColumnValue<C["valueType"]>;
};

/**
 * Metadata about a dataset, containing an id, route, and schema.
 * @property id - The id of the dataset.
 * @property route - The route of the dataset.
 * @property dataset_schema - The schema of the dataset.
 */
export interface DatasetMetadata {
  id: string;
  route: string;
  dataset_schema: DatasetSchema;
}

/**
 * A dataset with the source data. Directly insertable into an ECharts
 * dataset.
 * @template M - The metadata of the dataset.
 * @property isLoading - Whether the dataset is loading.
 * @property source - The source data of the dataset.
 */
export interface Dataset<M extends DatasetMetadata> {
  id: M["id"];
  isLoading: boolean;
  /* An array of mappings of column names to values of the given type. */
  source: ExtractDatasetRowType<M["dataset_schema"]>[];
}

/**
 * The schema of the TacoBI, containing a list of datasets. It is *required*
 * to use the `as const` assertion to ensure that the types are narrowed to the
 * exact literal values, allowing us to infer proper column names and types.
 * @property datasets - The datasets emitted by TacoBI backend.
 * @example
 * const tacoBISpec = {
 *   datasets: [
 *     {
 *       id: "dataset-1",
 *       route: "/dataset-1",
 *       dataset_schema: {
 *         columns: [
 *           {
 *             name: "Beverage",
 *             valueType: "string",
 *           },
 *         ],
 *       },
 *     },
 *   ],
 * } as const satisfies TacoBISpec;
 */
export interface TacoBISpec {
  datasets: DatasetMetadata[];
}

/**
 * Utility type to extract the metadata of a dataset.
 * @param S - The TacoBISpec.
 * @returns The metadata of a dataset.
 */
export type ExtractDatasetMetadata<S extends TacoBISpec> =
  S["datasets"][number];

/**
 * Utility type to extract the ids of all datasets in the TacoBISpec.
 * @param S - The TacoBISpec.
 * @returns The ids of all datasets in the TacoBISpec.
 */
export type ExtractDatasetIds<S extends TacoBISpec> =
  ExtractDatasetMetadata<S>["id"];

/**
 * Utility type to extract the schema of a dataset.
 * @param S - The TacoBISpec.
 * @returns The schema of a dataset.
 */
export type ExtractDatasetSchemas<S extends TacoBISpec> =
  ExtractDatasetMetadata<S>["dataset_schema"];

/**
 * Utility type to extract the row type based on the full spec from
 * using the ID
 */
export type ExtractDatasetRowTypeFromSpec<
  S extends TacoBISpec,
  ID extends ExtractDatasetIds<S>,
> = Resolve<
  ExtractDatasetRowType<
    Extract<S["datasets"][number], { id: ID }>["dataset_schema"]
  >
>;

export type ExtractDatasetRowTypeFromDataset<
  D extends Dataset<DatasetMetadata>,
> = Resolve<
  ExtractDatasetRowType<
    D extends Dataset<infer M> ? M["dataset_schema"] : never
  >
>;

/**
 * Utility type to extract the column names of a dataset.
 * @param S - The TacoBISpec.
 * @param ID - The id of the dataset.
 * @returns The column name literals of the dataset.
 *
 */
export type ExtractDatasetColumnNames<
  S extends TacoBISpec,
  ID extends ExtractDatasetIds<S>,
> = Extract<
  S["datasets"][number],
  { id: ID }
>["dataset_schema"]["columns"][number]["name"];
