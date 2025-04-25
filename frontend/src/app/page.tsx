// Component Imports
import { KPICardsSection } from "@/app/components/KPICardsSection";
import { MarketsTable } from "@/app/components/markets-table";
import { ProtocolStatsChart } from "@/components/charts/protocol-stats-chart/ProtocolStatsChart";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center gap-y-6 pb-10">
      <KPICardsSection />
      <ProtocolStatsChart />
      {/* <MarketsTable /> */}
    </div>
  );
}
