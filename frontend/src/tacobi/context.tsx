import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { ViewRequest } from "./request";
import { InferDataObjectFromView, Schema, View } from "./schema";

type ViewParamWithInput<V extends View> = {
  route: V["route"];
  input: V["input_schema"];
};

type ViewParamWithoutInput<V extends View> = {
  route: V["route"];
};

export type UseViewParams<V extends View> = V["input_schema"] extends undefined
  ? ViewParamWithoutInput<V>
  : ViewParamWithInput<V>;

type DiscriminatedUseViewParams<V extends View> =
  | (ViewParamWithoutInput<V> & { hasInput: false })
  | (ViewParamWithInput<V> & { hasInput: true });

/**
 * A function that returns a ViewRequest for a given view.
 *
 * @template S - The schema of the TacoBI application.
 * @template V - The view of the TacoBI application.
 *
 * @param route - The route of the view.
 * @param input - The input of the view.
 *
 * @returns A ViewRequest for the given view.
 */
type UseViewFn<S extends Schema> = <
  R extends S["views"][number]["route"],
  I extends Extract<S["views"][number], { route: R }>["input_schema"],
>(
  route: R,
  ...input: I extends undefined ? [] : [I]
) => ViewRequest<Extract<S["views"][number], { route: R }>>;

/**
 * The context of the TacoBI application.
 *
 * @template S - The schema of the TacoBI application.
 */
export interface TacoBIContext<S extends Schema> {
  useView: UseViewFn<S>;
}

/**
 * Creates a TacoBIContext.
 *
 * @template S - The schema of the TacoBI application.
 *
 * @returns A TacoBIContext with the given schema.
 */
const createTacoBIContext = <S extends Schema>() =>
  createContext<TacoBIContext<S>>({
    useView: () => {
      throw new Error("useView not implemented");
    },
  });

/**
 * The internal state of the TacoBI context.
 *
 * @template S - The schema of the TacoBI application.
 */
interface TacoBIState<S extends Schema> {
  context: ReturnType<typeof createTacoBIContext<S>>;
  schema: S;
  url: string;
}

/**
 * Props for the creating a TacoBI application.
 *
 * @template S - The schema of the TacoBI application.
 */
interface CreateTacoBIProps<S extends Schema> {
  schema: S;
  url: string;
}

/**
 * Creates a TacoBIContext within which views can be called and memoed.
 *
 * @template S - The schema of the TacoBI application.
 *
 * @returns A state that you must pass to the provider, and a hook for using
 * the TacoBIContext.
 */
export const createTacoBI = <S extends Schema>({
  schema,
  url,
}: CreateTacoBIProps<S>) => {
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
      schema,
      url,
    },
    useTacoBI,
  };
};

/**
 * A map of the views from the schema that do not have input parameters.
 *
 * @template S - The schema of the TacoBI application.
 */
type ViewRequestByRoute<S extends Schema> = {
  [K in S["views"][number]["route"]]: ViewRequest<
    Extract<S["views"][number], { route: K }>
  >;
};

/**
 * Internal function for fetching a view.
 *
 * @template S - The schema of the TacoBI application.
 * @template V - The view of the TacoBI application.
 *
 * @param state - The state of the TacoBI application.
 * @param cachedViewRequestsByRoute - A map of the cached view requests.
 * @param route - The route of the view.
 * @param input - The input of the view.
 *
 * @returns A view request.
 */
function useViewInternal<S extends Schema, V extends S["views"][number]>(
  state: TacoBIState<S>,
  cachedViewRequestsByRoute: ViewRequestByRoute<S>,
  params: DiscriminatedUseViewParams<V>,
) {
  const [viewRequest, setViewRequest] = useState<ViewRequest<V>>({
    route: params.route,
    state: "pending",
  } as ViewRequest<V>);

  // If the view has input parameters, extract them so we
  // can type safely use them.
  const inputParams = useMemo(() => {
    if (params.hasInput) {
      return params.input;
    }
    return undefined;
  }, [
    params.hasInput, // @ts-expect-error - using just params instead of params.input will cause infinite re-renders
    params.input,
  ]);

  // If the view has no input parameters, it must be cached and
  // we can get it from the cache. If it is not there,
  // something has gone wrong.
  useEffect(() => {
    if (inputParams === undefined) {
      if (cachedViewRequestsByRoute[params.route] === undefined) {
        throw new Error(
          `View ${params.route} is not present in the cache. Cached view requests: ${JSON.stringify(cachedViewRequestsByRoute)}`,
        );
      }
      setViewRequest(cachedViewRequestsByRoute[params.route]);
    }
  }, [params.route, inputParams, cachedViewRequestsByRoute]);

  // If the view has input parameters, we need to fetch it.
  useEffect(() => {
    if (inputParams !== undefined) {
      fetch(
        `${state.url}${params.route}?${new URLSearchParams(inputParams).toString()}`,
      )
        .then((data) => {
          setViewRequest({
            route: params.route,
            state: "loaded",
            data: data as unknown as InferDataObjectFromView<V>,
          });
        })
        .catch((error: Error) => {
          setViewRequest({
            route: params.route,
            state: "error",
            error: error,
          });
        });
    }
  }, [params.route, state.url, inputParams]);

  return viewRequest;
}

/**
 * A provider for the TacoBI context.
 *
 * @template S - The schema of the TacoBI application.
 */
export const TacoBIProvider = <S extends Schema>({
  children,
  state,
}: {
  children: ReactNode;
  state: TacoBIState<S>;
}) => {
  // Compute all the views that do not have input parameters
  // so we can fetch them on page load.
  const viewsWithoutInputParameters = useMemo(
    () => state.schema.views.filter((view) => view.input_schema === undefined),
    [state.schema.views],
  );

  // Views without input parameters are independently
  // fetched and cached on page load. Views that use
  // input parameters are fetched when needed and are
  // differed to outside the cache.
  const [cachedViewRequestsByRoute, setCachedViewRequestsByRoute] = useState<
    ViewRequestByRoute<S>
  >(() => {
    return viewsWithoutInputParameters.reduce((acc, view) => {
      acc[view.route as keyof ViewRequestByRoute<S>] = {
        route: view.route,
        state: "pending" as const,
      };
      return acc;
    }, {} as ViewRequestByRoute<S>);
  });

  // Requests are launched asynchronously
  useEffect(() => {
    // For each view without input parameters, fetch and cache it
    viewsWithoutInputParameters.forEach((view) => {
      fetch(`${state.url}${view.route}`)
        // If the view loads successfully, mark it as loaded.
        .then((data) => {
          setCachedViewRequestsByRoute((prev) => ({
            ...prev,
            [view.route]: {
              route: view.route,
              state: "loaded",
              data,
            },
          }));
        })
        // If the view fails to load, mark it as an error.
        .catch((error) => {
          setCachedViewRequestsByRoute((prev) => ({
            ...prev,
            [view.route]: {
              route: view.route,
              state: "error",
              error,
            },
          }));
        });
    });
  }, [state.url, viewsWithoutInputParameters]);

  // Pre-populate the useView hook with the cached view requests.
  const useView: UseViewFn<S> = <
    V extends S["views"][number],
    I extends V["input_schema"],
  >(
    route: V["route"],
    ...input: I extends undefined ? [] : [I]
  ) => {
    const hasInput =
      viewsWithoutInputParameters.find((view) => view.route === route) !==
      undefined;

    return useViewInternal(state, cachedViewRequestsByRoute, {
      route,
      input,
      hasInput,
    } as DiscriminatedUseViewParams<V>);
  };

  const context = {
    useView,
  };

  return (
    <state.context.Provider value={context}>{children}</state.context.Provider>
  );
};
