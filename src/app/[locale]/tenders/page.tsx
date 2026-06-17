import PublicTenderListPage from "@/components/public/tenders/PublicTenderListPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function TendersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <PublicTenderListPage
          dict={dict.dashboard.operateur.tendersList}
          locale={locale as Locale}
        />
      </div>
    </main>
  );
}