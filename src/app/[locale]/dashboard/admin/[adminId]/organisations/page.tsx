// app/[locale]/dashboard/admin/organisations/page.tsx
import OrganisationsPage from "@/components/dashboard/admin/organisations/Organisationspage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return <OrganisationsPage locale={locale} dict={dict.dashboard.admin.organisationsPage} />;
}