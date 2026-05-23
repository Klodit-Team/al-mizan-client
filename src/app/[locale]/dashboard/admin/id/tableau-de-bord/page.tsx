import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";
import AdminDashboardContent from "@/components/dashboard/admin/AdminDashboardContent";

interface DashboardPageProps {
      params: Promise<{ locale: Locale }>;
}
 
export default async function AdminDashboardPage({ params }: DashboardPageProps) {
    const { locale } = await params;
    const commonDict = await getDictionary(locale);

    return <AdminDashboardContent locale={locale} dict={commonDict.dashboard.admin} />;
}
