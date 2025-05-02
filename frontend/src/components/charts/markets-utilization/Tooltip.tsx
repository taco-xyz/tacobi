// React Imports
import { FC } from "react";
import {
  TooltipCard,
  TooltipDate,
  TooltipDivider,
  TooltipLineLegend,
} from "@/components/charts/lib/tooltip";

/**
 * Protocol stats tooltip props.
 *
 * @property date - The date of the tooltip.
 * @property utilization - The markets utilization value of the tooltip.
 */
export interface TooltipProps {
  date: string;
  utilization: string;
}

/**
 * @description This component is used to display a tooltip for the protocol stats chart.
 * @param date - The date of the tooltip.
 * @param utilization - The markets utilization value of the tooltip.
 * @returns The ProtocolStatsTooltip component.
 */
export const Tooltip: FC<TooltipProps> = ({ date, utilization }) => {
  return (
    <TooltipCard>
      {/* Date */}
      <TooltipDate date={date} />

      {/* Divider */}
      <TooltipDivider />

      {/* Legends */}
      <TooltipLineLegend
        variant="blue"
        label="Utilization"
        value={utilization}
      />
    </TooltipCard>
  );
};
