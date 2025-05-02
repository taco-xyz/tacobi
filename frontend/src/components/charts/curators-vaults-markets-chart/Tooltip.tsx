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
    <TooltipCard>
      <TooltipDate date={date} />
      <TooltipDivider />
      <TooltipLineLegend variant="orange" label="Markets" value={marketCount} />
      <TooltipLineLegend variant="blue" label="Vaults" value={vaultCount} />
      <TooltipLineLegend
        variant="purple"
        label="Curators"
        value={curatorCount}
      />
    </TooltipCard>
  );
};
