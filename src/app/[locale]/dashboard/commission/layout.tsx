import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface CommissionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CommissionLayout({
  children,
  params,
}: CommissionLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;

  if (userType === "admin") {
    redirect(`/${locale}/dashboard/admin/tableau-de-bord`);
  }

  if (userType === "operateur") {
    redirect(`/${locale}/dashboard/operateur/tableau-de-bord`);
  }

  if (userType === "contractant") {
    redirect(`/${locale}/dashboard/contractant/tableau-de-bord`);
  }

  const commonDict = await getDictionary(locale as Locale);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f1f5f9" }}
    >
      <Navbar
        isLoggedIn={true}
        userInitial="C"
        userName="Membre Commission"
        userCompany="Commission d'évaluation"
        userRole="COMMISSION"
        dict={commonDict.navbar}
        locale={locale as Locale}
      />
      <div className="flex flex-1">
        <Sidebar
          locale={locale as Locale}
          role="commission"
          dict={commonDict.sidebar}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}