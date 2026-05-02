import ServiceContractantDashboard from "@/components/dashboard/contractant/ServiceContractantDashboard";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import { defaultServiceContractantDashboardDict } from "@/lib/contractantDefaults";

interface ContractantDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantDashboardPage({
  params,
}: ContractantDashboardPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const dashboardDict =
    (
      dict as unknown as {
        dashboard: { contractant: { dashboard: typeof defaultServiceContractantDashboardDict } };
      }
    ).dashboard.contractant.dashboard || defaultServiceContractantDashboardDict;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <ServiceContractantDashboard dict={dashboardDict} />
    </main>
  );
}
