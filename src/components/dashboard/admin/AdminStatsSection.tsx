"use client";

import type { getDictionary } from "@/i18n/get-dictionaries";
import { useAdministratorDashboardStatsQuery } from "@/services/administrator-dashboard/queries";
import StatsCards from "./StatsCards";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface AdminStatsSectionProps {
  dict: CommonDict["dashboard"]["admin"];
}

export default function AdminStatsSection({ dict }: AdminStatsSectionProps) {
  const { data, isLoading, error } = useAdministratorDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error?.message || "Impossible de charger les données du tableau de bord."}
      </div>
    );
  }

  return <StatsCards stats={data} dict={dict.stats} />;
}
