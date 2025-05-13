import { Resolve } from "./utils/resolve";

// --------------------------------------------------------------
// Schema Types
// --------------------------------------------------------------

export type PropertyType = "string" | "number";

/**
 * Represents an individual property in the Pydantic data schema.
 *
 * @property title - The title of the property.
 * @property type - The type of the property.
 */
export interface PropertySchema {
  title: string;
  type: PropertyType;
}

/**
 * Represents the type of the data schema.
 */
export type DataType = "object" | "array";

/**
 * Represents the mapping of property names to their schemas.
 */
export type DataSchemaProperties = Record<string, PropertySchema>;

/**
 * Represents the data schema.
 *
 * @property properties - The mapping of property names to their schemas.
 * @property required - The list of required properties.
 * @property type - The type of the data schema.
 */
export interface DataSchema {
  properties: DataSchemaProperties;
  required: readonly string[];
  type: DataType;
}

/**
 * Represents an individual view in the schema.
 *
 * @property route - The route of the view.
 * @property data_schema - The data schema of the view.
 * @property input_schema - The input schema of the view.
 */
export interface View {
  route: string;
  data_schema: DataSchema;
  input_schema: Record<string, string> | undefined;
}

/**
 * Represents the schema of the TacoBI endpoints.
 *
 * @property views - The list of exposed views in the schema.
 */
export interface Schema {
  views: readonly View[];
}

// --------------------------------------------------------------
// Extraction Utilities
// --------------------------------------------------------------

/**
 * Extracts the valid view routes from the schema.
 *
 * @param S - The schema to extract the valid view routes from.
 * @returns The list of valid view routes.
 */
export type ExtractValidViewRoutes<S extends Schema> =
  S["views"][number]["route"];

/**
 * Extracts a view from the schema based on the route.
 *
 * @param S - The schema to extract the view from.
 * @param R - The route of the view to extract.
 * @returns The view that matches the route.
 */
export type ExtractView<
  S extends Schema,
  R extends ExtractValidViewRoutes<S>,
> = Extract<S["views"][number], { route: R }>;

// --------------------------------------------------------------
// Object Inference
// --------------------------------------------------------------

/**
 * Infer the type of a property from the property schema.
 *
 * @param T - The property schema to infer the type from.
 * @returns The type of the property.
 */
export type InferFromPropertySchema<T extends PropertySchema> =
  T["type"] extends "string"
    ? string
    : T["type"] extends "number"
      ? number
      : never;

/**
 * Infer the type of an object from the data schema properties.
 *
 * @param T - The data schema properties to infer the type from.
 * @returns The type of the object.
 */
export type InferObjectFromDataSchemaProperties<
  T extends DataSchemaProperties,
> = Resolve<{
  [K in keyof T]: InferFromPropertySchema<T[K]>;
}>;

/**
 * Infer the type of an object from the data schema.
 *
 * @param T - The data schema to infer the type from.
 * @returns The type of the object.
 */
export type InferObjectFromDataSchema<T extends DataSchema> =
  T["type"] extends "object"
    ? InferObjectFromDataSchemaProperties<T["properties"]>
    : T["type"] extends "array"
      ? InferObjectFromDataSchemaProperties<T["properties"]>[]
      : never;

/**
 * Infer the type of an input object from the view.
 *
 * @param V - The view to infer the input object from.
 * @returns The type of the input object.
 */
export type InferInputObjectFromView<V extends View> =
  V["input_schema"] extends DataSchema
    ? InferObjectFromDataSchema<V["input_schema"]>
    : never;

/**
 * Infer the type of a data object from the view.
 *
 * @param V - The view to infer the data object from.
 * @returns The type of the data object.
 */
export type InferDataObjectFromView<V extends View> =
  V["data_schema"] extends DataSchema
    ? InferObjectFromDataSchema<V["data_schema"]>
    : never;
