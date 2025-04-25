// Component Imports
import { ProtocolStatsChart } from "@/components/charts/protocol-stats-chart/ProtocolStatsChart";

/**
 * Displays protocols stats like:
 * - Total borrow and supply in USD
 * - Total supplier and borrower rewards in USD and Morpho (toggle)
 */
export const ProtocolStatsChart: FC = () => {
  const { datasets, chartRef } = useController();

  if (datasets === null) return null;

  return (
    <div
      className="flex w-full flex-col gap-y-6 rounded-lg p-6 ring ring-gray-200 transition-all duration-200 dark:ring-gray-800"
      style={{
        transition: "box-shadow 0.2s ease-in-out",
      }}
    >
      <ProtocolStatsChart />
    </div>
  );
};
