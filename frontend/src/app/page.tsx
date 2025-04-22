// Component Imports
import { KPICardsSection } from "@/app/components/KPICardsSection";
import { MarketsTable } from "@/app/components/markets-table";

export default function Home() {
  return (
    <div className="mt-5 flex w-full flex-col items-center justify-center gap-5">
      <KPICardsSection />
      <MarketsTable />
    </div>
  );
}
