import CommissionEvaluationsPage from "@/components/dashboard/commission/evaluations/CommissionEvaluationsPage";
import { cookies } from "next/headers";

async function getCommissionMemberUserId(): Promise<string | undefined> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return undefined;

    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
    if (!meRes.ok) return undefined;

    const meData = await meRes.json();
    return meData?.user?.userId || undefined;
  } catch {
    return undefined;
  }
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommissionTableauDeBordPage({ params }: PageProps) {
  const { locale } = await params;
  const userId = await getCommissionMemberUserId();
  return <CommissionEvaluationsPage locale={locale} userId={userId} />;
}
