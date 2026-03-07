import RegisterNavbar from "@/components/layout/RegisterNavbar";
import { getAuthDictionary, getDictionary } from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

interface ResetPasswordPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { locale } = await params;
  const dict = await getAuthDictionary(locale);
  const dictCommon = await getDictionary(locale);
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <RegisterNavbar dict={dictCommon.navbarRegister} locale={locale} />
      <main className="flex-1 w-full lg:max-w-2xl max-w-xl mx-auto py-16  ">
        <div className="px-4 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {dict.resetPassword.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {dict.resetPassword.subtitle}
          </p>
        </div>
        <ResetPasswordForm dict={dict.resetPassword} />
      </main>
    </div>
  );
}