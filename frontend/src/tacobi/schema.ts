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
 * Utility type to extract the row type of a dataset.
 * @param S - The dataset schema.
 * @returns The row type of the dataset.
 */
export type ExtractDatasetRowType<S extends DatasetSchema> = {
  [C in S["columns"][number] as C["name"]]: SelectColumnValue<C["valueType"]>;
};

/**
 * A dataset that is pending.
 * @template M - The metadata of the dataset.
 * @property id - The id of the dataset.
 * @property state - The state of the dataset.
 */
export interface DatasetRequestPending<M extends DatasetMetadata> {
  id: M["id"];
  state: "pending";
}

/**
 * A dataset that is in an error state.
 * @template M - The metadata of the dataset.
 * @property id - The id of the dataset.
 * @property state - The state of the dataset.
 * @property error - The error that occurred.
 */
export interface DatasetRequestError<M extends DatasetMetadata> {
  id: M["id"];
  state: "error";
  error: Error;
}

/**
 * A dataset that is loaded.
 * @template M - The metadata of the dataset.
 * @property id - The id of the dataset.
 * @property state - The state of the dataset.
 */
export interface DatasetRequestLoaded<M extends DatasetMetadata> {
  id: M["id"];
  state: "loaded";
  source: Resolve<ExtractDatasetRowType<M["dataset_schema"]>>[];
}

/**
 * A dataset with the source data. See {@link DatasetRequestPending},
 * {@link DatasetRequestError}, and {@link DatasetRequestLoaded} for more information.
 *
 * @abstract You can use tagged unions to manipulate this type.
 */
export type DatasetRequest<M extends DatasetMetadata> =
  | DatasetRequestPending<M>
  | DatasetRequestError<M>
  | DatasetRequestLoaded<M>;

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
 * Utility type to extract the column names of a dataset.
 * @param S - The TacoBISpec.
 * @param ID - The id of the dataset.
 * @returns The column name literals of the dataset.
 *
 */
export type ExtractDatasetColumnNames<
  S extends TacoBISpec,
  ID extends ExtractDatasetIds<S>
> = Extract<
  S["datasets"][number],
  { id: ID }
>["dataset_schema"]["columns"][number]["name"];
