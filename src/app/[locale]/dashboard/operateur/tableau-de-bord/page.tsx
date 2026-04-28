import OperateurDashboard from "@/components/dashboard/operateur/OperateurDashboard";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function OperateurTableauDeBordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  
  return <OperateurDashboard dict={dict.dashboard.operateur.dashboard} locale={locale as Locale} />;
}