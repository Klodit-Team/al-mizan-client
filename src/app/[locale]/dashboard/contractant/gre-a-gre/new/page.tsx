import Link from "next/link";
import GreAGreRequestForm from "@/components/dashboard/contractant/gre-a-gre/GreAGreRequestForm";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

interface NewGreAGreRequestPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewGreAGreRequestPage({
  params,
}: NewGreAGreRequestPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const greAGreDict = (dict as any)?.dashboard?.contractant?.greAGre;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> {greAGreDict?.title || "Demandes Gre a Gre"}{" "}
          <span className="mx-1">/</span> {greAGreDict?.createBtn || "Nouvelle demande"}
        </p>

        <header className="mt-1 mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {greAGreDict?.createBtn || "Nouvelle demande Gre a Gre"}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#4CAF50]">
              {greAGreDict?.subtitle || "Preparation et soumission de la demande"}
            </p>
          </div>

          <Link
            href={`/${locale}/dashboard/contractant/gre-a-gre`}
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {greAGreDict?.form?.backBtn || "Retour a la liste"}
          </Link>
        </header>
      </section>

      <GreAGreRequestForm locale={locale} dict={greAGreDict?.form} />
    </main>
  );
}
