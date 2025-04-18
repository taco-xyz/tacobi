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
 * Utility type to extract the ids of all datasets in the TacoBISpec.
 * @param S - The TacoBISpec.
 * @returns The ids of all datasets in the TacoBISpec.
 */
export type ExtractDatasetIds<S extends TacoBISpec> =
  S["datasets"][number]["id"];

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
