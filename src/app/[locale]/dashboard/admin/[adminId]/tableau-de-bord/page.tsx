
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getDictionary } from "@/i18n/get-dictionaries";
import { type Locale } from "@/i18n/config";
import Link from "next/link";
import StatsCards from "@/components/dashboard/admin/StatsCards";
import ActionsRapides from "@/components/dashboard/admin/ActionsRapides";
import ActiviteRecente from "@/components/dashboard/admin/ActiviteRecente";
import AlertesIA from "@/components/dashboard/admin/AlertesIA";
import EcheancesProchaines from "@/components/dashboard/admin/EcheancesProchaines";
import SupportGuide from "@/components/dashboard/admin/SupportGuide";
interface DashboardPageProps {
      params: Promise<{ locale: Locale }>;
   
}
 
export default async function AdminDashboardPage({ params }: DashboardPageProps) {
    const { locale } = await params;
    const commonDict = await getDictionary(locale);

    let stats = {
    utilisateursActifs: 0,
    aoEnCours: 0,
    recoursOuverts: 0,
    incidentsIA: 0,
        };

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/admin/stats`, {
            cache: 'no-store'
        });
        if (response.ok) {
            const data = await response.json();
            stats = { ...stats, ...data };
        }
    } catch (error) {
        console.error("Failed to fetch dashboard stats, using defaults:", error);
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f5f9" }}>
            
            <div className="flex flex-1">
 
                <main className="flex-1 p-6 space-y-5 overflow-auto">
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{commonDict.dashboard.admin.title}</h1>
                            <p className="text-sm text-gray-400 mt-0.5">{commonDict.dashboard.admin.subtitle}</p>
                        </div>
                        
                        
                    </div>
 
                   
                    <StatsCards
                        
                        dict={commonDict.dashboard.admin.stats}
                        stats={stats}
                    />
 
                   
                    <ActionsRapides locale={locale} role="admin" dict={commonDict.dashboard.admin.actionsRapides} />
 
                    
                    <div className="grid grid-cols-3 gap-5">
                       
                        <div className="col-span-2">
                            <ActiviteRecente locale={locale} dict={commonDict.dashboard.admin.activiteRecente} />
                        </div>
 
                       
                        <div className="space-y-4">
                            <AlertesIA locale={locale} dict={commonDict.dashboard.admin.alertesIA} />
                            <EcheancesProchaines locale={locale} dict={commonDict.dashboard.admin.echeances} />
                            <SupportGuide locale={locale} dict={commonDict.dashboard.admin.support} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

