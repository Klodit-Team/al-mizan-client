import AoCreationWizard from "@/components/dashboard/contractant/appels-offres/AoCreationWizard";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import { defaultTendersListDict } from "@/lib/contractantDefaults";
import { getServiceContractantTenderDraftById } from "@/services/tenders";

interface ContractantTenderEditPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ContractantTenderEditPage({
  params,
}: ContractantTenderEditPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  const tendersListDict =
    (dict as { tendersList?: typeof defaultTendersListDict }).tendersList ||
    defaultTendersListDict;
  const draft = await getServiceContractantTenderDraftById(id);

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <AoCreationWizard
        dict={tendersListDict.aoCreation}
        mode="edit"
        tenderId={id}
        initialDraft={draft}
      />
    </main>
  );
}
