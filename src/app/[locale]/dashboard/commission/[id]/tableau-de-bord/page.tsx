import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import CommissionTableauDeBord from "@/components/dashboard/commission/CommissionTableauDeBord";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  await getDictionary(locale); // preload dict si nécessaire

  return <CommissionTableauDeBord locale={locale} userId={id} />;
}