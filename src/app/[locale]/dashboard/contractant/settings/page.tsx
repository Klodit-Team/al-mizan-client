import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

interface ContractantSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantSettingsPage({
  params,
}: ContractantSettingsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="p-6 space-y-4 overflow-auto">
      <h1 className="text-2xl font-semibold text-gray-900">{dict.sidebar?.organizationSettings || "Paramètres de l'organisation"}</h1>
      <p className="text-sm text-gray-600 max-w-3xl">
        {(dict as any).dashboard?.contractant?.settings?.description || "Cette page centralise les paramètres du compte contractant. Les sections de configuration seront ajoutées ici."}
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
        {(dict as any).dashboard?.contractant?.settings?.status || "Paramètres en cours d'intégration."}
      </div>
    </main>
  );
}
