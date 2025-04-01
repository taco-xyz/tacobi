import { Dataset, DatasetMetadata } from "./schema";

/**
 * Interface for a function that fetches a dataset from the server.
 * @param dataset_metadata - The metadata of the dataset to fetch.
 * @returns The dataset.
 *
 * The user can implement this however way they want. A default implementation
 * is provided by default.
 */
export interface FetchDatasetFn<D extends DatasetMetadata> {
  (dataset_metadata: D): Promise<Dataset<D["dataset_schema"]>>;
}
