import SessionsPage from "@/components/dashboard/admin/sessions/SessionsPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return <SessionsPage locale={locale} dict={dict.dashboard.admin.sessionsPage} />;
}
