import type { Locale } from "@/i18n/config";
import CommissionDetailsPage from "@/components/dashboard/commission/CommissionDetailsPage";

interface PageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export default async function CommissionDetailPage({ params }: PageProps) {
  const { locale, id } = await params;

  return <CommissionDetailsPage locale={locale} commissionId={id} />;
}
