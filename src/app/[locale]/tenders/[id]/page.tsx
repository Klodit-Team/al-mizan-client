import PublicTenderDetailPage from "@/components/public/tenders/PublicTenderDetailPage";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <PublicTenderDetailPage
          aoId={id}
          dict={(dict as any).dashboard.contractant.appelsOffres.detail}
          locale={locale}
        />
      </div>
    </main>
  );
}