"use client";

import { useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import type { ServiceContractantDashboardDict } from "@/lib/contractantDefaults";
import { useContractantDashboardQuery } from "@/services/contractant-dashboard/queries";
import DashboardHeader from "./DashboardHeader";
import SummaryCards from "./SummaryCards";
import QuickActions from "./QuickActions";
import RecentActivityList from "./RecentActivityList";
import AlertsPanel from "./AlertsPanel";

interface ServiceContractantDashboardProps {
  dict: ServiceContractantDashboardDict;
}

export default function ServiceContractantDashboard({
  dict,
}: ServiceContractantDashboardProps) {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const { data, isLoading, error } = useContractantDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
        </div>
        <div className="h-44 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error?.message || dict.errorLoading}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DashboardHeader
        title={dict.header.title}
        subtitle={dict.header.subtitle}
        createButton={dict.header.createButton}
        locale={locale}
      />

      <SummaryCards stats={data.stats} labels={dict.summary} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <QuickActions
            locale={locale}
            title={dict.quickActions.title}
            createAo={dict.quickActions.createAo}
            myAos={dict.quickActions.myAos}
            commissions={dict.quickActions.commissions}
          />

          <RecentActivityList
            title={dict.recentActivity.title}
            viewAll={dict.recentActivity.viewAll}
            empty={dict.recentActivity.empty}
            items={data.activities}
          />
        </div>

        <AlertsPanel
          alertsTitle={dict.alerts.title}
          alertsEmpty={dict.alerts.empty}
          deadlinesTitle={dict.alerts.deadlinesTitle}
          supportTitle={dict.support.title}
          supportGuide={dict.support.guide}
          supportContact={dict.support.contact}
          alerts={data.alerts}
          deadlines={data.deadlines}
        />
      </div>
    </div>
  );
}
