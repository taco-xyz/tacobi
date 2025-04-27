import { FC } from "react";
import { CardInternalProps } from "@/components/card";

export const FullCard: FC<CardInternalProps> = ({
  title,
  description,
  children,
  sources,
  lastUpdated,
  loadingState,
}) => {
  return <div>FullCard</div>;
};
