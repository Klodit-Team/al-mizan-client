import OeAoDetailPage from "@/components/dashboard/operateur/appels-offres/OeAoDetailPage";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface OeAoDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OperateurAoDetailPage({ params }: OeAoDetailPageProps) {
  const { id, locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <OeAoDetailPage aoId={id} dict={(dict as any).dashboard.contractant.appelsOffres.detail} locale={locale as Locale} />;
}