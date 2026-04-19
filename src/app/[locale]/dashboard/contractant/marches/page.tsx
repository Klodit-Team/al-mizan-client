import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

interface ContractantMarchesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantMarchesPage({
  params,
}: ContractantMarchesPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="p-6 space-y-4 overflow-auto">
      <h1 className="text-2xl font-semibold text-gray-900">{dict.sidebar.marchesRecords}</h1>
      <p className="text-sm text-gray-600 max-w-3xl">
        Les informations de marches sont accessibles depuis les dossiers d&apos;appel d&apos;offres (attribution et
        contractualisation).
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <Link
          href={`/${locale}/dashboard/contractant/appels-offres`}
          className="inline-flex items-center rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Voir les dossiers d&apos;AO
        </Link>
      </div>
    </main>
  );
}
