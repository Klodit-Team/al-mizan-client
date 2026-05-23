import { notFound } from "next/navigation";

import MarcheDetailView from "@/components/dashboard/contractant/marches/MarcheDetailView";
import { getServiceContractantMarcheById } from "@/services/tenderMarches";

interface MarcheDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MarcheDetailPage({
  params,
}: MarcheDetailPageProps) {
  const { locale, id } = await params;
  const marche = await getServiceContractantMarcheById(id);

  if (!marche) {
    notFound();
  }

  return (
    <main className="space-y-4 overflow-auto p-6">
      <MarcheDetailView locale={locale} initialMarche={marche} />
    </main>
  );
}
