import AdminGreAGreDetailPage from "@/components/dashboard/admin/gre-a-gre/AdminGreAGreDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return <AdminGreAGreDetailPage id={id} locale={locale} />;
}
