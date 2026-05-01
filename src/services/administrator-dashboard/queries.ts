import { useQuery } from "@tanstack/react-query";
import {
  getAdministratorDashboardStats,
  type AdministratorDashboardStats,
} from "./api";
import { administratorDashboardKeys } from "./keys";

export function useAdministratorDashboardStatsQuery() {
  return useQuery<AdministratorDashboardStats, Error>({
    queryKey: administratorDashboardKeys.stats(),
    queryFn: getAdministratorDashboardStats,
  });
}
