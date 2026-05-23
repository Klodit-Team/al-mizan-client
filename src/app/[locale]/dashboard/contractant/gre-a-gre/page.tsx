import GreAGreListContainer from "@/components/dashboard/contractant/gre-a-gre/GreAGreListContainer";
import { type Locale } from "@/i18n/config";

import { getDictionary } from "@/i18n/get-dictionaries";

interface GreAGreRequestsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function GreAGreRequestsPage({
  params,
}: GreAGreRequestsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const greAGreDict = (dict as any)?.dashboard?.contractant?.greAGre ?? {};

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <GreAGreListContainer locale={locale as Locale} dict={greAGreDict} />
    </main>
  );
}
