import { KPICard, FullCard, CardKind } from "@/components/card/kinds";
import { DataSource, ExtractDatasetIds } from "@/tacobi/schema";
import { ReactNode, FC, useMemo } from "react";
import { spec, Spec, useTacoBI } from "@/app/tacobi-config";

/**
 * Represents the props of a TacoBI card.
 * @template S - The spec of the TacoBI context.
 * @param datasetIds - The dataset ids of the card.
 * @param title - The title of the card.
 * @param description - The description of the card.
 * @param children - The children of the card.
 * @param cardKind - The kind of the card. For possible types, see {@link CardKind}.
 */
export interface CardProps {
  datasetIds: ExtractDatasetIds<Spec>[];
  title: string;
  description: string;
  children: ReactNode;
  cardKind: CardKind;
}

/**
 * Props for a card that is still loading.
 * @param loadingState - The loading state of the card (whether any of the
 * datasets are still loading or have errored).
 */
export interface CardInternalPropsLoading extends CardProps {
  loadingState: "pending";
}

/**
 * Props for a card that has errored.
 * @param loadingState - The loading state of the card (whether any of the
 * datasets are still loading or have errored).
 */
export interface CardInternalPropsError extends CardProps {
  loadingState: "error";
}

/**
 * Props for a card that has loaded.
 * @param sources - The sources of the card (based on the dataset IDs).
 * @param lastUpdated - The last updated date of the card (which we know
 * based on the oldest updated dataset in the datasetIDs).
 * @param loadingState - The loading state of the card (whether any of the
 * datasets are still loading or have errored).
 */
export interface CardInternalPropsLoaded extends CardProps {
  loadingState: "loaded";
  sources: DataSource[];
  lastUpdated: string;
}

/**
 * Props for a card that is still loading, is loaded, or has errored.
 * See {@link CardInternalPropsLoading}, {@link CardInternalPropsError}, and
 * {@link CardInternalPropsLoaded} for more details.
 */
export type CardInternalProps =
  | CardInternalPropsLoading
  | CardInternalPropsError
  | CardInternalPropsLoaded;

export type CardInternalLoadingState = CardInternalProps["loadingState"];

/**
 * An internal card component that is used to render a card based on the card
 * kind.
 * @param props - The props of the card.
 * @returns The card.
 */
export const CardInternal: FC<CardInternalProps> = (props) => {
  switch (props.cardKind) {
    case "full":
      return <FullCard {...props} />;
    case "kpi":
      return <KPICard {...props} />;
  }
};

/**
 * General card component that is used to render a card based on the card
 * kind. As the specified datasets are loaded, the card updates with set
 * properties.
 * @param props - The props of the card. Refer to {@link CardProps} for more
 * details.
 * @returns The card.
 */
export const Card: FC<CardProps> = (props) => {
  const { useDatasets } = useTacoBI();
  const datasets = useDatasets(props.datasetIds);

  // Compute properties derived from the datasets
  const { sources, lastUpdated, loadingState } = useMemo(() => {
    // Check that all datasetIDs passed are valid
    props.datasetIds.forEach((id) => {
      if (!spec.datasets.some((meta) => meta.id === id)) {
        throw new Error(
          `Dataset ID ${id} is not specified in the spec. Valid IDs are: ${spec.datasets.map((meta) => meta.id).join(", ")}`,
        );
      }
    });

    // Compile the unique sources for the card based on the dataset ids.
    const allSources = spec.datasets
      .filter((meta) => props.datasetIds.includes(meta.id))
      .flatMap((meta) => meta.sources);
    const sources = Array.from(
      new Map(allSources.map((source) => [source.name, source])).values(),
    );

    // TODO - For now, we'll use a static timestamp - FIXME
    const lastUpdated = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // Based on the loading state of the datasets, determine the loading
    // state of the card.
    const loadingStates: ("pending" | "error" | "loaded")[] = datasets.map(
      (dataset) => dataset.state,
    );
    const loadingState: CardInternalLoadingState = loadingStates.includes(
      "error",
    )
      ? "error"
      : loadingStates.includes("pending")
        ? "pending"
        : "loaded";

    return {
      sources,
      lastUpdated,
      loadingState,
    };
  }, [props.datasetIds, datasets]);

  return (
    <CardInternal
      datasetIds={props.datasetIds}
      title={props.title}
      description={props.description}
      cardKind={props.cardKind}
      sources={sources}
      lastUpdated={lastUpdated}
      loadingState={loadingState}
    >
      {props.children}
    </CardInternal>
  );
};
