// React Imports
import { FC } from "react";

// Chart Color Variants
import {
  ChartColorVariant,
  getChartColorVariant,
} from "../../lib/chartColorVariants";

// Context Imports
import { useTheme } from "@/hooks/useTheme";

/**
 * @description Line Legend Props
 * @property title - The title of the line legend.
 * @property colorVariant - The color variant of the line legend.
 * @property displayValue - The value to display in the line legend.
 */
export interface LineLegendProps {
  title: string;
  colorVariant: ChartColorVariant;
  displayValue: string;
}

/**
 * @description This component is used to display a line legend for any line series in a chart.
 * @param title - The title of the line legend.
 * @param colorVariant - The color variant of the line legend.
 * @param displayValue - The value to display in the line legend.
 * @returns The LineLegend component.
 */
export const LineLegend: FC<LineLegendProps> = ({
  title,
  colorVariant,
  displayValue,
}) => {
  // Extract the theme
  const theme = useTheme();

  // Get the color variant
  const { lineStyle } = getChartColorVariant(colorVariant, theme);

  return (
    <div className="flex flex-col items-start gap-y-0.5">
      <span className="flex flex-row items-center gap-x-1.5">
        {/* Color Legend */}
        <div
          style={{
            backgroundColor: lineStyle.color,
          }}
          className="h-1 w-6 rounded-sm"
        />
        {/* Title */}
        <h1
          className="w-full text-start text-xs font-normal text-gray-700 dark:text-gray-400"
          style={{
            transition: "color 0.2s ease-in-out",
          }}
        >
          {title}
        </h1>
      </span>
      {/* Value */}
      <p
        className="text-md font-semibold text-gray-900 dark:text-gray-300"
        style={{
          transition: "color 0.2s ease-in-out",
        }}
      >
        {displayValue}
      </p>
    </div>
  );
};
