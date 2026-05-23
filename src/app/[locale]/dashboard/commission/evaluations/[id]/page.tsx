import CommissionEvaluationPage from "@/components/dashboard/commission/evaluations/CommissionEvaluationPage";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EvaluationPage({ params }: PageProps) {
  const { locale, id } = await params;
  return <CommissionEvaluationPage locale={locale} aoId={id} />;
}
