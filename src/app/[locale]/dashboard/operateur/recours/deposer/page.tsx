import FileRecoursPage from "@/components/dashboard/operateur/recours/FileRecoursPage";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <FileRecoursPage dict={(dict as any).dashboard.operateur.dashboard.recours.create} locale={locale as Locale} />;
}