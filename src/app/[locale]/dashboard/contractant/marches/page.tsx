import MarchesListContainer from "@/components/dashboard/contractant/marches/MarchesListContainer";
import { listServiceContractantMarches } from "@/services/tenderMarches";

interface ContractantMarchesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantMarchesPage({
  params,
}: ContractantMarchesPageProps) {
  const { locale } = await params;
  const data = await listServiceContractantMarches();

  return (
    <main className="p-6 space-y-4 overflow-auto">
      <MarchesListContainer locale={locale} data={data} isLoading={false} />
    </main>
  );
}

