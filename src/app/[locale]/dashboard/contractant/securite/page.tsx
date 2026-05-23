import SecuritySettingsPage from "@/components/dashboard/contractant/profile/SecuritySettingsPage";

interface ContractantSecurityPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantSecurityPage({
  params,
}: ContractantSecurityPageProps) {
  const { locale } = await params;

  return (
    <main className="space-y-5 overflow-auto p-6">
      <SecuritySettingsPage locale={locale} />
    </main>
  );
}
