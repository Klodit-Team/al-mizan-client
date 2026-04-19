import { type Locale } from "@/i18n/config";
import AvisEditorForm from "@/components/dashboard/contractant/appels-offres/avis/AvisEditorForm";

interface CreateTenderAvisPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function CreateTenderAvisPage({
  params,
}: CreateTenderAvisPageProps) {
  const { locale, id } = await params;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> Appels d'offres{" "}
          <span className="mx-1">/</span> Creation avis
        </p>

        <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Creer un avis</h1>
            <p className="mt-1 text-sm font-medium text-[#4CAF50]">
              AO {id} - Preparation de publication
            </p>
          </div>
        </div>
      </section>

      <AvisEditorForm locale={locale as Locale} aoId={id} />
    </main>
  );
}
