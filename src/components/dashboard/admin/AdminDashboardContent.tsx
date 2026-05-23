"use client";

import { type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { useAdministratorDashboardQuery } from "@/services/administrator-dashboard/queries";
import ActionsRapides from "@/components/dashboard/admin/ActionsRapides";
import ActiviteRecente from "@/components/dashboard/admin/ActiviteRecente";
import AdminStatsSection from "@/components/dashboard/admin/AdminStatsSection";
import AlertesIA from "@/components/dashboard/admin/AlertesIA";
import EcheancesProchaines from "@/components/dashboard/admin/EcheancesProchaines";
import SupportGuide from "@/components/dashboard/admin/SupportGuide";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface AdminDashboardContentProps {
  locale: Locale;
  dict: CommonDict["dashboard"]["admin"];
}

export default function AdminDashboardContent({ locale, dict }: AdminDashboardContentProps) {
  const { data, error, isLoading } = useAdministratorDashboardQuery();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f5f9" }}>
      <div className="flex flex-1">
        <main className="flex-1 p-6 space-y-5 overflow-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
            </div>
          </div>

          <AdminStatsSection
            dict={dict}
            stats={data?.stats}
            isLoading={isLoading}
            error={error}
          />

          <ActionsRapides locale={locale} role="admin" dict={dict.actionsRapides} />

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <ActiviteRecente
                locale={locale}
                dict={dict.activiteRecente}
                activities={data?.activities}
              />
            </div>

            <div className="space-y-4">
              <AlertesIA
                locale={locale}
                dict={dict.alertesIA}
                alertes={data?.aiAlerts}
              />
              <EcheancesProchaines
                locale={locale}
                dict={dict.echeances}
                echeances={data?.deadlines}
              />
              <SupportGuide
                locale={locale}
                dict={dict.support}
                links={data?.supportLinks}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
