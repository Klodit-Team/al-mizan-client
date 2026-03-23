// app/[locale]/dashboard/admin/utilisateurs/page.tsx
import UsersPage from "@/components/dashboard/admin/users/Userspage";
import { type Locale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    return <UsersPage locale={locale} />;
}
