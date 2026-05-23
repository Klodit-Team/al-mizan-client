import MarchesListContainer from "@/components/dashboard/contractant/marches/MarchesListContainer";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import { listServiceContractantMarches } from "@/services/tenderMarches";

interface ContractantMarchesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantMarchesPage({
  params,
}: ContractantMarchesPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = await listServiceContractantMarches();

  return (
    <main className="p-6 space-y-4 overflow-auto">
      <h1 className="text-2xl font-semibold text-gray-900">
        {dict.sidebar.marchesRecords}
      </h1>
      <MarchesListContainer locale={locale} data={data} isLoading={false} />
    </main>
  );
}
