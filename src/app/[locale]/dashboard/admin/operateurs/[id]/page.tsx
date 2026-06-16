import { getDictionary } from "@/i18n/get-dictionaries";
import OperateurDetailPage from "@/components/dashboard/admin/operateurs/Operateurdetailpage";

interface PageProps {
  params: {
    locale: string;
    id: string;
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  const dict = await getDictionary(locale as any);

  return <OperateurDetailPage locale={locale} dict={dict.dashboard.admin.operateursPage} />;
}
