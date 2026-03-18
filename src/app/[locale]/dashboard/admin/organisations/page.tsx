// app/[locale]/dashboard/admin/organisations/page.tsx
import OrganisationsPage from "@/components/dashboard/admin/organisations/Organisationspage";
import { type Locale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    return <OrganisationsPage locale={locale} />;
}