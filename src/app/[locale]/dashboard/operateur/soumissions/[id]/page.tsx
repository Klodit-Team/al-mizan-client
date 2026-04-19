import SoumissionDetailPage from "@/components/dashboard/operateur/soumissions/SoumissionDetailPage";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SoumissionDetailRoute({ params }: Props) {
  const { id, locale } = await params;

  // Handle template-like URLs such as /soumissions/:id to avoid querying an invalid identifier.
  if (!id || id === ":id" || id.startsWith(":")) {
    redirect(`/${locale}/dashboard/operateur/soumissions`);
  }

  return <SoumissionDetailPage subId={id} />;
}