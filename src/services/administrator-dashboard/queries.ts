import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getAdministratorDashboardActivities,
  getAdministratorDashboardAiAlerts,
  getAdministratorDashboardData,
  getAdministratorDashboardDeadlines,
  getAdministratorDashboardStats,
  getAdministratorDashboardSupportLinks,
  type AdministratorActivityItem,
  type AdministratorAiAlert,
  type AdministratorDashboardStats,
  type AdministratorDeadlineItem,
  type AdministratorSupportLink,
} from "./api";
import { administratorDashboardKeys } from "./keys";

export function useAdministratorDashboardQuery() {
  const [
    detailsQuery,
    statsQuery,
    activitiesQuery,
    aiAlertsQuery,
    deadlinesQuery,
    supportLinksQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: administratorDashboardKeys.details(),
        queryFn: getAdministratorDashboardData,
      },
      {
        queryKey: administratorDashboardKeys.stats(),
        queryFn: getAdministratorDashboardStats,
      },
      {
        queryKey: administratorDashboardKeys.activities(),
        queryFn: getAdministratorDashboardActivities,
      },
      {
        queryKey: administratorDashboardKeys.aiAlerts(),
        queryFn: getAdministratorDashboardAiAlerts,
      },
      {
        queryKey: administratorDashboardKeys.deadlines(),
        queryFn: getAdministratorDashboardDeadlines,
      },
      {
        queryKey: administratorDashboardKeys.supportLinks(),
        queryFn: getAdministratorDashboardSupportLinks,
      },
    ],
  });

  const data = detailsQuery.data
    ? {
        ...detailsQuery.data,
        stats: statsQuery.data ?? detailsQuery.data.stats,
        activities: activitiesQuery.data ?? detailsQuery.data.activities,
        aiAlerts: aiAlertsQuery.data ?? detailsQuery.data.aiAlerts,
        deadlines: deadlinesQuery.data ?? detailsQuery.data.deadlines,
        supportLinks: supportLinksQuery.data ?? detailsQuery.data.supportLinks,
      }
    : undefined;

  return {
    ...detailsQuery,
    data,
    error:
      detailsQuery.error ||
      statsQuery.error ||
      activitiesQuery.error ||
      aiAlertsQuery.error ||
      deadlinesQuery.error ||
      supportLinksQuery.error,
    isLoading:
      detailsQuery.isLoading ||
      statsQuery.isLoading ||
      activitiesQuery.isLoading ||
      aiAlertsQuery.isLoading ||
      deadlinesQuery.isLoading ||
      supportLinksQuery.isLoading,
  };
}

export function useAdministratorDashboardStatsQuery() {
  return useQuery<AdministratorDashboardStats, Error>({
    queryKey: administratorDashboardKeys.stats(),
    queryFn: getAdministratorDashboardStats,
  });
}

export function useAdministratorDashboardActivitiesQuery() {
  return useQuery<AdministratorActivityItem[], Error>({
    queryKey: administratorDashboardKeys.activities(),
    queryFn: getAdministratorDashboardActivities,
  });
}

export function useAdministratorDashboardAiAlertsQuery() {
  return useQuery<AdministratorAiAlert[], Error>({
    queryKey: administratorDashboardKeys.aiAlerts(),
    queryFn: getAdministratorDashboardAiAlerts,
  });
}

export function useAdministratorDashboardDeadlinesQuery() {
  return useQuery<AdministratorDeadlineItem[], Error>({
    queryKey: administratorDashboardKeys.deadlines(),
    queryFn: getAdministratorDashboardDeadlines,
  });
}

export function useAdministratorDashboardSupportLinksQuery() {
  return useQuery<AdministratorSupportLink[], Error>({
    queryKey: administratorDashboardKeys.supportLinks(),
    queryFn: getAdministratorDashboardSupportLinks,
  });
}
