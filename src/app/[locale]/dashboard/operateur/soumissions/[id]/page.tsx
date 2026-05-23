import SoumissionDetailPage from "@/components/dashboard/operateur/soumissions/SoumissionDetailPage";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SoumissionDetailRoute({ params }: Props) {
  const { id, locale } = await params;

  // Handle template-like URLs such as /soumissions/:id to avoid querying an invalid identifier.
  if (!id || id === ":id" || id.startsWith(":")) {
    redirect(`/${locale}/dashboard/operateur/soumissions`);
  }

  const dict = await getDictionary(locale as Locale);

  return <SoumissionDetailPage subId={id} dict={(dict as any).dashboard.operateur.dashboard.soumissions.detail} locale={locale as Locale} />;
}