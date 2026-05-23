import NotificationsPage from "@/components/dashboard/contractant/notifications/NotificationsPage";

export default function ContractantNotificationsPage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <main className="space-y-5 overflow-auto p-6">
      <NotificationsPage locale={params.locale} />
    </main>
  );
}
