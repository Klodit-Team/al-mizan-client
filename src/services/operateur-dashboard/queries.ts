import { useQuery } from "@tanstack/react-query";
import {
  getOperateurDashboardData,
  type OeDashboardData,
} from "./api";
import { operateurDashboardKeys } from "./keys";

export function useOperateurDashboardQuery() {
  return useQuery<OeDashboardData, Error>({
    queryKey: operateurDashboardKeys.details(),
    queryFn: getOperateurDashboardData,
  });
}
