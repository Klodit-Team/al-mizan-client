import { useQuery } from "@tanstack/react-query";
import {
  getContractantDashboardData,
  getContractantActivityFeed,
  type ContractantDashboardData,
  type ContractantActivityItem,
} from "./api";
import { contractantDashboardKeys } from "./keys";

export function useContractantDashboardQuery() {
  return useQuery<ContractantDashboardData, Error>({
    queryKey: contractantDashboardKeys.details(),
    queryFn: getContractantDashboardData,
  });
}

export function useContractantActivityFeedQuery() {
  return useQuery<ContractantActivityItem[], Error>({
    queryKey: contractantDashboardKeys.activities(),
    queryFn: getContractantActivityFeed,
  });
}
