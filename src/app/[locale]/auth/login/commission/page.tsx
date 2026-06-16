import { type Locale, getLocaleDirection } from "@/i18n/config";
import { getDictionary, getAuthDictionary } from "@/i18n/get-dictionaries";
import LoginLeftPanel from "@/components/layout/LoginLeftPanel";
import CommissionLoginForm from "@/components/forms/commission/CommissionLoginForm";

interface CommissionLoginPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function CommissionLoginPage({ params }: CommissionLoginPageProps) {
  const { locale } = await params;
  const commonDict = await getDictionary(locale);
  const authDict = await getAuthDictionary(locale);
  const direction = getLocaleDirection(locale);

  return (
    <div
      className="h-screen flex flex-col lg:flex-row items-stretch overflow-hidden bg-white"
      style={{ direction }}
    >
      <LoginLeftPanel dict={commonDict.loginPanel} locale={locale} />

      {/* Panneau droit — w-full pour cohérence avec la page login principale */}
      <div className="w-full flex items-center justify-center py-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md px-8">
          <CommissionLoginForm
            dict={authDict.commissionLogin}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}