import RegisterForm from "@/components/forms/RegisterForm";
import RegisterNavbar from "@/components/layout/RegisterNavbar";
import { getAuthDictionary, getDictionary } from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";

interface RegisterPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  const dict = await getAuthDictionary(locale);
  const dictCommon = await getDictionary(locale);
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <RegisterNavbar dict={dictCommon.navbarRegister} locale={locale} />
      <main className="flex-1 w-full max-w-2xl mx-auto py-16  ">
        <div className="px-4 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {dict.register.fields.roleOperateurEconomique}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {dict.register.subtitle}
          </p>
        </div>
        <RegisterForm dict={dict.register} initialRole="OPERATEUR_ECONOMIQUE" />
      </main>
    </div>
  );
}