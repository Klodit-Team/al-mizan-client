import AoDetailPage from "@/components/dashboard/contractant/appels-offres/AoDetailPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

type DetailTabParam =
  | "general"
  | "lots"
  | "cdc"
  | "criteria"
  | "soumissions"
  | "evaluation"
  | "attribution"
  | "recours"
  | "avis";

interface ContractantTenderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function parseTab(tab?: string): DetailTabParam {
  const allowed: DetailTabParam[] = [
    "general",
    "lots",
    "cdc",
    "criteria",
    "soumissions",
    "evaluation",
    "attribution",
    "recours",
    "avis",
  ];

  if (tab && allowed.includes(tab as DetailTabParam)) {
    return tab as DetailTabParam;
  }

  return "soumissions";
}

export default async function ContractantTenderDetailPage({
  params,
  searchParams,
}: ContractantTenderDetailPageProps) {
  const { locale, id } = await params;
  const { tab } = await searchParams;
  const initialTab = parseTab(tab);
  const dict = await getDictionary(locale as Locale);
  const contractantDict = (dict as any).dashboard?.contractant || {};

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <AoDetailPage
        locale={locale as Locale}
        dict={contractantDict}
        aoId={id}
        initialTab={initialTab}
      />
    </main>
  );
}
