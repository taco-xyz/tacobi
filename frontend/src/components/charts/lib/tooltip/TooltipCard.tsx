import { FC } from "react";

/**
 * @description Default tooltip card props.
 * @property children - The children to display in the tooltip card.
 */
export interface TooltipCardProps {
  children: React.ReactNode;
}

/**
 * @description Default tooltip card for displaying data in a chart.
 */
export const TooltipCard: FC<TooltipCardProps> = ({ children }) => {
  return (
    <div className="flex flex-col gap-y-1.5 rounded-md bg-white/50 p-3 text-xs text-gray-900 shadow-2xl ring shadow-gray-500/15 ring-gray-200 backdrop-blur-sm dark:bg-gray-950/50 dark:text-gray-300 dark:shadow-gray-800/15 dark:ring-gray-800">
      {children}
    </div>
  );
};
