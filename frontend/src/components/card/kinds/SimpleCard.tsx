// React Imports
import { FC } from "react";

// Card Imports
import { CardInternalProps } from "@/components/card";

export const SimpleCard: FC<CardInternalProps> = ({
  // title,
  // description,
  children,
  // sources,
  // lastUpdated,
  // loadingState,
}) => {
  return (
    <div
      className="flex w-full flex-col gap-y-6 rounded-lg bg-white p-6 shadow ring ring-gray-200 dark:bg-gray-950/50 dark:ring-gray-900"
      style={{
        transition:
          "box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out",
      }}
    >
      {children}
    </div>
  );
};
