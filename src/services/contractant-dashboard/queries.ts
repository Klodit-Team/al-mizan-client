import { useQuery } from "@tanstack/react-query";
import {
  getContractantDashboardData,
  type ContractantDashboardData,
} from "./api";
import { contractantDashboardKeys } from "./keys";

export function useContractantDashboardQuery() {
  return useQuery<ContractantDashboardData, Error>({
    queryKey: contractantDashboardKeys.details(),
    queryFn: getContractantDashboardData,
  });
}
