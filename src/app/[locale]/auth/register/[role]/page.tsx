import RegisterForm from "@/components/forms/RegisterForm";
import RegisterNavbar from "@/components/layout/RegisterNavbar";
import { getAuthDictionary, getDictionary } from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";
import { redirect } from "next/navigation";

interface RegisterByRolePageProps {
  params: Promise<{ locale: Locale; role: string }>;
}

const resolveInitialRole = (rawRole: string) => {
  if (rawRole === "contractant") {
    return "SERVICE_CONTRACTANT" as const;
  }

  if (rawRole === "operateur") {
    return "OPERATEUR_ECONOMIQUE" as const;
  }

  return null;
};

export default async function RegisterByRolePage({ params }: RegisterByRolePageProps) {
  const { locale, role } = await params;
  const initialRole = resolveInitialRole(role);

  if (!initialRole) {
    redirect(`/${locale}/auth/register/operateur`);
  }

  const dict = await getAuthDictionary(locale);
  const dictCommon = await getDictionary(locale);

  const roleTitle =
    initialRole === "SERVICE_CONTRACTANT"
      ? dict.register.fields.roleServiceContractant
      : dict.register.fields.roleOperateurEconomique;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <RegisterNavbar dict={dictCommon.navbarRegister} locale={locale} />
      <main className="flex-1 w-full max-w-2xl mx-auto py-16">
        <div className="px-4 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">{roleTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{dict.register.subtitle}</p>
        </div>
        <RegisterForm dict={dict.register} initialRole={initialRole} />
      </main>
    </div>
  );
}
