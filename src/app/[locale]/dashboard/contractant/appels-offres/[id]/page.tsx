import AoDetailPage from "@/components/dashboard/contractant/appels-offres/AoDetailPage";
import { type Locale } from "@/i18n/config";
import { getServiceContractantTenders } from "@/services/dashboard";

interface ContractantTenderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ContractantTenderDetailPage({
  params,
}: ContractantTenderDetailPageProps) {
  const { locale, id } = await params;
  const tenders = await getServiceContractantTenders().catch(() => []);
  const tender = tenders.find((item) => item.id === id) || null;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <AoDetailPage locale={locale as Locale} aoId={id} tender={tender} />
    </main>
  );
}
