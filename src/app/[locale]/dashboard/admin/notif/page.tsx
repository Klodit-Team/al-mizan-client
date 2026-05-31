import NotificationsPageClient from "@/components/dashboard/admin/notif/Notificationspage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return <NotificationsPageClient dict={dict.dashboard.admin.notificationsPage} />;
}