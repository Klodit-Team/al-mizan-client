import SoumissionDetailPage from "@/components/dashboard/operateur/soumissions/SoumissionDetailPage";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SoumissionDetailRoute({ params }: Props) {
  const { id } = await params;
  return <SoumissionDetailPage subId={id} />;
}