import CommissionEvaluationsPage from "@/components/dashboard/commission/evaluations/CommissionEvaluationsPage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommissionTableauDeBordPage({ params }: PageProps) {
  const { locale } = await params;
  return <CommissionEvaluationsPage locale={locale} />;
}
