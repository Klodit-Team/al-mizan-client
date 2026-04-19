import OeAoDetailPage from "@/components/dashboard/operateur/appels-offres/OeAoDetailPage";

interface OeAoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OperateurAoDetailPage({ params }: OeAoDetailPageProps) {
  const { id } = await params;
  return <OeAoDetailPage aoId={id} />;
}