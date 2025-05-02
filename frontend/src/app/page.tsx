// Component Imports
import { KPICardsSection } from "@/app/components/KPICardsSection";
import { ProtocolStatsChart } from "@/components/charts/protocol-stats-chart";
import { CuratorsVaultsMarketsChart } from "@/components/charts/curators-vaults-markets-chart";
import { MarketsUtilizationChart } from "@/components/charts/markets-utilization";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center gap-y-6 pb-10">
      <KPICardsSection />
      <ProtocolStatsChart />
      <div className="flex w-full gap-x-6">
        <div className="w-1/2">
          <CuratorsVaultsMarketsChart />
        </div>
        <div className="w-1/2">
          <MarketsUtilizationChart />
        </div>
      </div>
    </div>
  );
}
