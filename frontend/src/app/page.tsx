// Component Imports
import { KPICardsSection } from "@/app/components/KPICardsSection";
import { ProtocolStatsChart } from "@/components/charts/protocol-stats-chart/ProtocolStatsChart";
import { CuratorsVaultsMarketsChart } from "@/components/charts/curators-vaults-markets-chart/Chart";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center gap-y-6 pb-10">
      <KPICardsSection />
      <ProtocolStatsChart />
      <CuratorsVaultsMarketsChart />
    </div>
  );
}
