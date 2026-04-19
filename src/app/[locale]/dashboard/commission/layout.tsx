import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface CommissionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CommissionLayout({
  children,
  params,
}: CommissionLayoutProps) {
  const { locale } = await params;
  const commonDict = await getDictionary(locale as Locale);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f1f5f9" }}
    >
      <Navbar
        isLoggedIn={true}
        userInitial="C"
        dict={commonDict.navbar}
        locale={locale as Locale}
      />
      <div className="flex flex-1">
        <Sidebar
          locale={locale as Locale}
          role="commission"
          dict={commonDict.sidebar}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
