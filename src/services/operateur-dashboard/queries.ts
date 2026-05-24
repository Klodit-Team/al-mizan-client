import { useQuery } from "@tanstack/react-query";
import {
  getOperateurDashboardData,
  getOperateurActivityFeed,
  type OeDashboardData,
  type OeActivityItem,
} from "./api";
import { operateurDashboardKeys } from "./keys";

export function useOperateurDashboardQuery() {
  return useQuery<OeDashboardData, Error>({
    queryKey: operateurDashboardKeys.details(),
    queryFn: getOperateurDashboardData,
  });
}

export function useOperateurActivityFeedQuery() {
  return useQuery<OeActivityItem[], Error>({
    queryKey: operateurDashboardKeys.activities(),
    queryFn: getOperateurActivityFeed,
  });
}
