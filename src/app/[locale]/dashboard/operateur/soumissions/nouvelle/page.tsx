import SoumissionWizard from "@/components/dashboard/operateur/soumissions/SoumissionWizard";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface NouvelleSoumissionPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NouvelleSoumissionPage({ params }: NouvelleSoumissionPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <SoumissionWizard dict={(dict as any).dashboard.operateur.dashboard.soumissions.wizard} locale={locale as Locale} />;
}