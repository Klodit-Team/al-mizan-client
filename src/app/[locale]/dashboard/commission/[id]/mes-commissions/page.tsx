import MesCommissionsPage from "@/components/dashboard/commission/MesCommissionsPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({
    params,
}: {
    params: Promise<{ locale: Locale; id: string }>;
}) {
    const { locale, id } = await params;
    const dict = await getDictionary(locale);
    
    return <MesCommissionsPage locale={locale} dict={dict.dashboard.commission.mesCommissionsPage} />;
}
