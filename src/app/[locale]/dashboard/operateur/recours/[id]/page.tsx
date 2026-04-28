import RecoursDetailPage from "@/components/dashboard/operateur/recours/RecoursDetailPage";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: Props) {
  const { id, locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <RecoursDetailPage recoursId={id} dict={(dict as any).dashboard.operateur.recours.detail} locale={locale as Locale} />;
}