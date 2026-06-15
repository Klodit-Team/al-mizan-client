// app/[locale]/dashboard/admin/organisations/[id]/page.tsx
import OrganisationDetailPage from "@/components/dashboard/admin/organisations/Organisationdetailpage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
    const { locale, id } = await params;
    const dict = await getDictionary(locale);
    return <OrganisationDetailPage locale={locale} orgId={id} dict={dict.dashboard.admin.organisationDetailPage} />;
}