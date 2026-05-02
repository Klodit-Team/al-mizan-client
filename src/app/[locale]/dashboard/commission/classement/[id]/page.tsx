import CommissionClassementPage from "@/components/dashboard/commission/classement/CommissionClassementPage";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ClassementPage({ params }: PageProps) {
  const { locale, id } = await params;
  return <CommissionClassementPage locale={locale} aoId={id} />;
}
