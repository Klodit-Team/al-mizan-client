import CommissionDetailPage from "@/components/dashboard/admin/commissions/CommissionDetailPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
    const { locale, id } = await params;
    const dict = await getDictionary(locale);
    return <CommissionDetailPage locale={locale} commissionId={id} dict={dict.dashboard.admin.commissionsPage} />;
}
