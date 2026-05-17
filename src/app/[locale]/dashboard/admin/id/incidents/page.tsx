import IncidentsPage from "@/components/dashboard/admin/incidents/IncidentsPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return <IncidentsPage locale={locale} dict={dict.dashboard.admin.incidentsPage} />;
}
