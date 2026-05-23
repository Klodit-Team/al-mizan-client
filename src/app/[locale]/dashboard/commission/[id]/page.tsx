import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import CommissionDetailContent from "@/components/dashboard/commission/CommissionDetailContent";

interface PageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export default async function CommissionDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale);
  const pageDict = dict.dashboard.commission.commissionDetailPage;

  return <CommissionDetailContent locale={locale} commissionId={id} dict={pageDict} />;
}