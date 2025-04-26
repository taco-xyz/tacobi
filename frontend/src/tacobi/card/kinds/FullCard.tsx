import { FC } from "react";
import { TacoBISpec } from "@/tacobi/schema";
import { CardInternalProps } from "@/tacobi/card";

export const FullCard: FC<CardInternalProps<TacoBISpec>> = ({
  title,
  description,
  children,
  sources,
  lastUpdated,
  loadingState,
}) => {
  return <div>FullCard</div>;
};
