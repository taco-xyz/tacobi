// React Imports
import { FC } from "react";

/**
 * Protocol stats tooltip props.
 *
 * @property date - The date of the tooltip.
 * @property curatorCount - The curator count value of the tooltip.
 * @property marketCount - The market count value of the tooltip.
 * @property vaultCount - The vault count value of the tooltip.
 */
export interface TooltipProps {
  date: string;
  curatorCount: string;
  marketCount: string;
  vaultCount: string;
}

/**
 * @description This component is used to display a tooltip for the protocol stats chart.
 * @param date - The date of the tooltip.
 * @param curatorCount - The curator count value of the tooltip.
 * @param marketCount - The market count value of the tooltip.
 * @param vaultCount - The vault count value of the tooltip.
 * @returns The ProtocolStatsTooltip component.
 */
export const Tooltip: FC<TooltipProps> = ({
  date,
  curatorCount,
  marketCount,
  vaultCount,
}) => {
  return (
    <div className="flex flex-col gap-y-1.5 rounded-md bg-white/50 p-3 text-xs text-gray-900 shadow-2xl ring shadow-gray-500/15 ring-gray-200 backdrop-blur-sm dark:bg-gray-950/50 dark:text-gray-300 dark:shadow-gray-800/15 dark:ring-gray-800">
      {/* Date */}
      <div className="font-semibold">{date}</div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

      {/* Curators Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-blue-500" />
          Curators
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {curatorCount}
        </span>
      </span>

      {/* Divider */}
      {/* <div className="h-px w-full border-b border-dashed border-gray-200 dark:border-gray-800" /> */}

      {/* Vaults Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-purple-500" />
          Vaults
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {vaultCount}
        </span>
      </span>

      {/* Markets Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-orange-500" />
          Markets
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {marketCount}
        </span>
      </span>
    </div>
  );
};
