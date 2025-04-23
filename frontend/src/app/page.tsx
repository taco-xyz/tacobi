// Component Imports
import { KPICardsSection } from "@/app/components/KPICardsSection";
import { MarketsTable } from "@/app/components/markets-table";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center gap-y-10">
      <KPICardsSection />
      <MarketsTable />
    </div>
  );
}
