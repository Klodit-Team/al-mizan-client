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
      <h1 className="text-2xl font-semibold text-gray-900">{dict.sidebar.organizationSettings}</h1>
      <p className="text-sm text-gray-600 max-w-3xl">
        Cette page centralise les parametres du compte contractant. Les sections de configuration seront ajoutees ici.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
        Parametres en cours d&apos;integration.
      </div>
    </main>
  );
}
