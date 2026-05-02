import DocumentValidationPage from "@/components/dashboard/commission/verification-documentaire/DocumentValidationPage";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ soumissionId?: string }>;
}

export default async function VerificationDocumentairePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  return <DocumentValidationPage locale={locale} soumissionId={sp?.soumissionId} />;
}