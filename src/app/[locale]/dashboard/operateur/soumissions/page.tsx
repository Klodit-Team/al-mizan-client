import MesSoumissionsPage from "@/components/dashboard/operateur/soumissions/MesSoumissionsPage";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface SoumissionsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SoumissionsPage({ params }: SoumissionsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <MesSoumissionsPage dict={(dict as any).dashboard.operateur.dashboard.soumissions.mesSoumissions} locale={locale as Locale} />;
}