/**
 * The type of the value in a column. These are based on the valid
 * ECharts types.
 */
type ColumnValue = "string" | "number";

/**
 * Column schema, containing a name and type of the value in each row.
 * @property name - The name of the column
 * @property valueType - The type of the value in the column
 */
export type ColumnSchema = {
  name: string;
  valueType: ColumnValue;
};

/**
 * Dataset schema, containing a list of headers defining the name and type of
 * the value in each row.
 * @property columns - The columns of the dataset.
 */
export type DatasetSchema = {
  columns: readonly ColumnSchema[];
};

/**
 * The type of a dataset.
 */
export type DatasetTypes = "tabular";

/**
 * Metadata about a specific dataset
 * @property id - The ID of the dataset
 * @property route - The route of the dataset
 * @property type - The type of the dataset
 * @property dataset_schema - The schema of the dataset
 */
export type DatasetMetadata = {
  id: string;
  route: string;
  type: DatasetTypes;
  dataset_schema: DatasetSchema;
};

/**
 * Collection of dataset metadatas and schemas generated from the schema JSON.
 */
export type Schema = {
  datasets: readonly DatasetMetadata[];
};

// ------------------------------------

/**
 * Converts a list of column schemas to a list of row types.
 * @template C - The list of column schemas.
 * @returns The list of row types.
 */
type ColumnsToRowType<C extends readonly ColumnSchema[]> = {
  [K in keyof C]: C[K] extends { valueType: "string" } ? string : number;
};

/**
 * A dataset is a table of data with a header and rows.
 * @template S - The schema of the dataset.
 * @property headerNames - The names of the columns in the dataset.
 * @property rows - The rows of the dataset.
 */
export type Dataset<S extends DatasetSchema> = {
  headerNames: S["columns"][number]["name"][];
  rows: ColumnsToRowType<S["columns"]>[];
};

/**
 * Extracts a dataset metadata from the schema based on its ID.
 * @template S - The schema type
 * @template ID - The dataset ID type
 * @param schema - The schema to extract the dataset metadata from.
 * @param id - The ID of the dataset metadata to extract.
 * @returns The dataset metadata.
 *
 * Only accepts dataset IDs contained within the schema JSON.
 */
export function getDatasetMetadata<
  S extends Schema,
  ID extends S["datasets"][number]["id"]
>(schema: S, id: ID): Extract<S["datasets"][number], { id: ID }> {
  const dataset = schema.datasets.find((d) => d.id === id);
  if (!dataset) {
    throw new Error(`Dataset with ID ${id} not found`);
  }
  return dataset as Extract<S["datasets"][number], { id: ID }>;
}

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

// Now TypeScript checks IDs properly
// export const dataset1Metadata = getDatasetMetadata(jsonSchema, "dataset-1");

// export const dataset1: Dataset<typeof dataset1Metadata.dataset_schema> = {
//   headerNames: ["Day", "Week"],
//   rows: [
//     ["Monday", 1],
//     ["Tuesday", 2],
//     ["Wednesday", 3],
//   ],
// };

/**
 * Zod schema for parsing the dataset schema from a JSON.
 *
 * @example
 * const schema = datasetZodSchema.parse(jsonSchema);
 * const dataset: Dataset<typeof schema.datasets[0]["dataset_schema"]> = {
 *   headerNames: ["Day"],
 *   rows: [[1], [2], [3]],
 * };
 */
// export const datasetZodSchema = z.object({
//   datasets: z.array(
//     z.object({
//       id: z.string(),
//       route: z.string(),
//       type: z.literal("tabular"),
//       dataset_schema: z.object({
//         columns: z.array(
//           z.object({
//             name: z.string(),
//             valueType: z.union([z.literal("string"), z.literal("number")]),
//           })
//         ),
//       }),
//     })
//   ),
// });

// const schema = datasetZodSchema.parse(jsonSchema);
