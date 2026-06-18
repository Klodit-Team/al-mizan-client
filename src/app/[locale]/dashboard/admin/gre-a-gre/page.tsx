import AdminGreAGreListPage from "@/components/dashboard/admin/gre-a-gre/AdminGreAGreListPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminGreAGreListPage locale={locale} />;
}
