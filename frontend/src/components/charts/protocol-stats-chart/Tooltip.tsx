// React Imports
import { FC } from "react";
import {
  TooltipCard,
  TooltipDate,
  TooltipDivider,
  TooltipLineLegend,
} from "@/components/charts/lib/tooltip";

/**
 * @description Protocol stats tooltip props.
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
 * @param date - The date of the tooltip.
 * @param borrow - The borrow value of the tooltip.
 * @param supply - The supply value of the tooltip.
 * @param supplierRewards - The supplier rewards value of the tooltip.
 * @param borrowerRewards - The borrower rewards value of the tooltip.
 * @returns The ProtocolStatsTooltip component.
 */
export const ProtocolStatsTooltip: FC<ProtocolStatsTooltipProps> = ({
  date,
  borrow,
  supply,
  supplierRewards,
  borrowerRewards,
}) => {
  return (
    <TooltipCard>
      {/* Date */}
      <TooltipDate date={date} />

      {/* Divider */}
      <TooltipDivider />

      {/* Main Stats */}
      <TooltipLineLegend variant="blue" label="Borrow" value={borrow} />
      <TooltipLineLegend variant="purple" label="Supply" value={supply} />

      {/* Divider */}
      <TooltipDivider dashed />

      {/* Rewards */}
      <TooltipLineLegend
        variant="orange"
        label="Supplier Rewards"
        value={supplierRewards}
      />
      <TooltipLineLegend
        variant="red"
        label="Borrower Rewards"
        value={borrowerRewards}
      />
    </TooltipCard>
  );
};
