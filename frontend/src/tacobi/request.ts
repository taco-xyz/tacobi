import { InferDataObjectFromView, View } from "./schema";
import { Resolve } from "./utils/resolve";

/**
 * A view that is pending.
 * @template V - The view of the dataset.
 * @property route - The route of the view.
 * @property state - The state of the dataset.
 */
export interface ViewRequestPending<V extends View> {
  route: V["route"];
  state: "pending";
}

/**
 * A view that is in an error state.
 * @template V - The view of the dataset.
 * @property route - The route of the view.
 * @property state - The state of the dataset.
 * @property error - The error that occurred.
 */
export interface ViewRequestError<V extends View> {
  route: V["route"];
  state: "error";
  error: Error;
}

/**
 * A view that is loaded.
 * @template V - The view of the dataset.
 * @property route - The route of the view.
 * @property response - The response of the view.
 */
export interface ViewRequestLoaded<V extends View> {
  route: V["route"];
  state: "loaded";
  data: InferDataObjectFromView<V>;
}

/**
 * A view with the source data. See {@link ViewRequestPending},
 * {@link ViewRequestError}, and {@link ViewRequestLoaded} for more information.
 *
 * @abstract You can use tagged unions to manipulate this type.
 */
export type ViewRequest<V extends View> =
  | Resolve<ViewRequestPending<V>>
  | Resolve<ViewRequestError<V>>
  | Resolve<ViewRequestLoaded<V>>;
