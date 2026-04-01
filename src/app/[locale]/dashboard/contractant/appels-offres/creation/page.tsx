import AoCreationWizard from "@/components/dashboard/contractant/appels-offres/AoCreationWizard";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import { defaultTendersListDict } from "@/lib/contractantDefaults";

interface ContractantTenderCreatePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantTenderCreatePage({
  params,
}: ContractantTenderCreatePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const tendersListDict =
    (dict as { tendersList?: typeof defaultTendersListDict }).tendersList ||
    defaultTendersListDict;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <AoCreationWizard dict={tendersListDict.aoCreation} />
    </main>
  );
}
