import CommissionsPage from "@/components/dashboard/admin/commissions/Commissionspage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return <CommissionsPage locale={locale} dict={dict.dashboard.admin.commissionsPage} />;
}
