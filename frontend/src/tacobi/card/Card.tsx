import { KPICard, FullCard, CardKind } from "@/tacobi/card/kinds";
import { DataSource, ExtractDatasetIds, TacoBISpec } from "@/tacobi/schema";
import { ReactNode, FC } from "react";

/**
 * Represents the props of a TacoBI card.
 * @template S - The spec of the TacoBI context.
 * @param datasetIds - The dataset ids of the card.
 * @param title - The title of the card.
 * @param description - The description of the card.
 * @param children - The children of the card.
 * @param cardKind - The kind of the card. For possible types, see {@link CardKind}.
 */
export interface CardProps<S extends TacoBISpec> {
  datasetIds: ExtractDatasetIds<S>[];
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
export interface CardInternalPropsLoading<S extends TacoBISpec>
  extends CardProps<S> {
  loadingState: "pending";
}

/**
 * Props for a card that has errored.
 * @param loadingState - The loading state of the card (whether any of the
 * datasets are still loading or have errored).
 */
export interface CardInternalPropsError<S extends TacoBISpec>
  extends CardProps<S> {
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
export interface CardInternalPropsLoaded<S extends TacoBISpec>
  extends CardProps<S> {
  loadingState: "loaded";
  sources: DataSource[];
  lastUpdated: string;
}

/**
 * Props for a card that is still loading, is loaded, or has errored.
 * See {@link CardInternalPropsLoading}, {@link CardInternalPropsError}, and
 * {@link CardInternalPropsLoaded} for more details.
 */
export type CardInternalProps<S extends TacoBISpec> =
  | CardInternalPropsLoading<S>
  | CardInternalPropsError<S>
  | CardInternalPropsLoaded<S>;

/**
 * An internal card component that is used to render a card based on the card
 * kind.
 * @param props - The props of the card.
 * @returns The card.
 */
export const CardInternal: FC<CardInternalProps<TacoBISpec>> = (props) => {
  switch (props.cardKind) {
    case "full":
      return <FullCard {...props} />;
    case "kpi":
      return <KPICard {...props} />;
  }
};
