import ProfilPage from "@/components/dashboard/operateur/profil/ProfilPage";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return <ProfilPage dict={(dict as any).dashboard.operateur.profil} locale={locale as Locale} />;
}