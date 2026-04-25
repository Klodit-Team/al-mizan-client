import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface OperateurLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function OperateurLayout({
  children,
  params,
}: OperateurLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;

  if (userType === "admin") {
    redirect(`/${locale}/dashboard/admin/tableau-de-bord`);
  }

  if (userType === "contractant") {
    redirect(`/${locale}/dashboard/contractant/tableau-de-bord`);
  }

  const commonDict = await getDictionary(locale as Locale);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F6F7F6" }}
    >
      <Navbar
        isLoggedIn={true}
        userInitial="K"
        userName="Karim Benali"
        userCompany="BENALI CONSTRUCTION SARL"
        userRole="OPERATEUR"
        dict={commonDict.navbar}
        locale={locale as Locale}
      />
      <div className="flex flex-1">
        <Sidebar
          locale={locale as Locale}
          role="operateur"
          dict={commonDict.sidebar}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}