import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";

interface DashboardPageProps {
    params: { locale: Locale };
}

export default async function AdminDashboardPage({ params: { locale } }: DashboardPageProps) {
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f5f9" }}>
            <Navbar
                isLoggedIn={true}
                userInitial="A"
                dict={dict.navbar}
                locale={locale}
            />
            <div className="flex flex-1">
                <Sidebar locale={locale} role="admin" dict={dict.sidebar} />
                <main className="flex-1 p-6">
                </main>
            </div>
        </div>
    );
}