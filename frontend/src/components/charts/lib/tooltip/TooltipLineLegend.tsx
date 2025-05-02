import { FC } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ChartColorVariant, getChartColorVariant } from "../chartColorVariants";

/**
 * @description Default tooltip line legend props.
 * @property variant - The color variant of the line.
 * @property label - The label to display.
 * @property value - The value to display.
 */
export interface TooltipLineLegendProps {
  variant: ChartColorVariant;
  label: string;
  value: string | number;
}

/**
 * @description Default tooltip line legend component.
 */
export const TooltipLineLegend: FC<TooltipLineLegendProps> = ({
  variant,
  label,
  value,
}) => {
  const theme = useTheme();
  const colorVariant = getChartColorVariant(variant, theme);

  return (
    <span className="flex flex-row items-center justify-between text-xs">
      <span className="flex flex-row items-center gap-x-1.5 text-gray-700 dark:text-gray-400">
        <div
          className={`h-1 w-4 rounded-sm ${colorVariant.itemStyle.backgroundTwColor}`}
        />
        {label}
      </span>
      <span className="pl-8 font-medium text-gray-900 dark:text-gray-300">
        {value}
      </span>
    </span>
  );
};
