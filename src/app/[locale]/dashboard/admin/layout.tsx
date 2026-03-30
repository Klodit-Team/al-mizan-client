
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";
 
interface AdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: Locale }>;
}
 
export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;
    const commonDict = await getDictionary(locale);
 
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f5f9" }}>
            <Navbar
                isLoggedIn={true}
                userInitial="A"
                dict={commonDict.navbar}
                locale={locale}
            />
            <div className="flex flex-1">
                <Sidebar locale={locale} role="admin" dict={commonDict.sidebar} />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}