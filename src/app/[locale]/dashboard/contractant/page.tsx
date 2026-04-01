import { type Locale } from "@/i18n/config";
import { redirect } from "next/navigation";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantDashboardPage({
  params,
}: DashboardPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/contractant/tableau-de-bord`);
}
