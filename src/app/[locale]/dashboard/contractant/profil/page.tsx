import MyProfilePage from "@/components/dashboard/contractant/profile/MyProfilePage";

interface ContractantProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContractantProfilePage({
  params,
}: ContractantProfilePageProps) {
  const { locale } = await params;

  return (
    <main className="space-y-5 overflow-auto p-6">
      <MyProfilePage locale={locale} />
    </main>
  );
}
