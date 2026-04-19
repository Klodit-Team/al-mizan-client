import GreAGreListContainer from "@/components/dashboard/contractant/gre-a-gre/GreAGreListContainer";
import { type Locale } from "@/i18n/config";

interface GreAGreRequestsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function GreAGreRequestsPage({
  params,
}: GreAGreRequestsPageProps) {
  const { locale } = await params;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <GreAGreListContainer locale={locale as Locale} />
    </main>
  );
}
