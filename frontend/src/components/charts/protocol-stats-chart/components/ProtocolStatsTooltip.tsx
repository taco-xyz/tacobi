// React Imports
import { FC } from "react";

/**
 * Protocol stats tooltip props.
 *
 * @property date - The date of the tooltip.
 * @property borrow - The borrow value of the tooltip.
 * @property supply - The supply value of the tooltip.
 * @property supplierRewards - The supplier rewards value of the tooltip.
 * @property borrowerRewards - The borrower rewards value of the tooltip.
 */
export interface ProtocolStatsTooltipProps {
  date: string;
  borrow: string;
  supply: string;
  supplierRewards: string;
  borrowerRewards: string;
}

/**
 * @function ProtocolStatsTooltip
 *
 * @description This component is used to display a tooltip for the protocol stats chart.
 * @param {string} date - The date of the tooltip.
 * @param {string} borrow - The borrow value of the tooltip.
 * @param {string} supply - The supply value of the tooltip.
 * @param {string} supplierRewards - The supplier rewards value of the tooltip.
 * @param {string} borrowerRewards - The borrower rewards value of the tooltip.
 * @returns {JSX.Element} The ProtocolStatsTooltip component.
 */
export const ProtocolStatsTooltip: FC<ProtocolStatsTooltipProps> = ({
  date,
  borrow,
  supply,
  supplierRewards,
  borrowerRewards,
}) => {
  return (
    <div className="flex flex-col gap-y-1.5 rounded-md bg-white/50 p-3 text-xs text-gray-900 shadow-2xl ring shadow-gray-500/15 ring-gray-200 backdrop-blur dark:bg-gray-950/50 dark:text-gray-300 dark:shadow-gray-800/15 dark:ring-gray-800">
      {/* Date */}
      <div className="font-semibold">{date}</div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

      {/* Borrow Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-blue-500" />
          Borrow
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {borrow}
        </span>
      </span>

      {/* Supply Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-purple-500" />
          Supply
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {supply}
        </span>
      </span>

      {/* Divider */}
      <div className="h-px w-full border-b border-dashed border-gray-200 dark:border-gray-800" />

      {/* Supplier Rewards Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-orange-500" />
          Supplier Rewards
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {supplierRewards}
        </span>
      </span>

      {/* Borrower Rewards Section */}
      <span className="flex flex-row items-center justify-between text-xs">
        <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
          <div className="h-1 w-4 rounded-sm bg-red-500" />
          Borrower Rewards
        </span>
        <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
          {borrowerRewards}
        </span>
      </span>
    </div>
  );
};
