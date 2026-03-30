// app/[locale]/dashboard/admin/utilisateurs/page.tsx
import UsersPage from "@/components/dashboard/admin/users/Userspage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    return <UsersPage locale={locale} dict={dict.dashboard.admin.usersPage} />;
}
