import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import AoListContainer from "@/components/dashboard/contractant/appels-offres/AoListContainer";
import { defaultTendersListDict } from "@/lib/contractantDefaults";

interface ContractantTendersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantTendersPage({
  params,
}: ContractantTendersPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const tendersListDict =
    (
      dict as unknown as {
        dashboard: { contractant: { tendersList: typeof defaultTendersListDict } };
      }
    ).dashboard.contractant.tendersList || defaultTendersListDict;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <AoListContainer locale={locale} dict={tendersListDict} />
    </main>
  );
}
