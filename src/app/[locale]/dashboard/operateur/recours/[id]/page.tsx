import RecoursDetailPage from "@/components/dashboard/operateur/recours/RecoursDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <RecoursDetailPage recoursId={id} />;
}