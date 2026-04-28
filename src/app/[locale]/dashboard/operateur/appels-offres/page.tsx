import OeAoListPage from "@/components/dashboard/operateur/appels-offres/OeAoListPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function OperateurAppelsOffresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <OeAoListPage dict={dict.dashboard.operateur.tendersList} locale={locale as Locale} />;
}