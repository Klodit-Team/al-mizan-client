import { useQuery } from "@tanstack/react-query";
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
  const detailsQuery = useQuery({
    queryKey: administratorDashboardKeys.details(),
    queryFn: getAdministratorDashboardData,
  });

  return {
    ...detailsQuery,
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
