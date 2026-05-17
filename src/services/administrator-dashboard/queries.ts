import { useQuery } from "@tanstack/react-query";
import {
  getAdministratorDashboardData,
  getAdministratorDashboardStats,
  type AdministratorDashboardData,
  type AdministratorDashboardStats,
} from "./api";
import { administratorDashboardKeys } from "./keys";

export function useAdministratorDashboardQuery() {
  return useQuery<AdministratorDashboardData, Error>({
    queryKey: administratorDashboardKeys.details(),
    queryFn: getAdministratorDashboardData,
  });
}

export function useAdministratorDashboardStatsQuery() {
  return useQuery<AdministratorDashboardStats, Error>({
    queryKey: administratorDashboardKeys.stats(),
    queryFn: getAdministratorDashboardStats,
  });
}
