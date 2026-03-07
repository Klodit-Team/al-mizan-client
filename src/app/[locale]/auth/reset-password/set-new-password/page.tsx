import RegisterNavbar from "@/components/layout/RegisterNavbar";
import { getAuthDictionary, getDictionary } from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";
import SetNewPasswordForm from "@/components/forms/SetNewPasswordForm";

interface SetNewPasswordProps {
  params: Promise<{ locale: Locale }>;
}

export default async function SetNewPassword({ params }: SetNewPasswordProps) {
  const { locale } = await params;
  const dict = await getAuthDictionary(locale);
  const dictCommon = await getDictionary(locale);
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <RegisterNavbar dict={dictCommon.navbarRegister} locale={locale} />
      <main className="flex-1 w-full lg:max-w-2xl max-w-xl mx-auto py-16  ">
        <div className="px-4 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {dict.setNewPassword.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {dict.setNewPassword.subtitle}
          </p>
        </div>
        <SetNewPasswordForm dict={dict.setNewPassword} />
      </main>
    </div>
  );
}