import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listContractantNotifications,
  getContractantUnreadCount,
  markContractantNotificationAsRead,
  markAllContractantNotificationsAsRead,
  type ContractantNotificationItem,
  type ContractantUnreadCount,
} from "./api";
import { contractantNotificationsKeys } from "./keys";

export function useContractantNotificationsQuery() {
  return useQuery<ContractantNotificationItem[], Error>({
    queryKey: contractantNotificationsKeys.list(),
    queryFn: listContractantNotifications,
  });
}

export function useContractantUnreadCountQuery() {
  return useQuery<ContractantUnreadCount, Error>({
    queryKey: contractantNotificationsKeys.unreadCount(),
    queryFn: getContractantUnreadCount,
  });
}

export function useMarkContractantNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: markContractantNotificationAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantNotificationsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: contractantNotificationsKeys.unreadCount() }),
      ]);
    },
  });
}

export function useMarkAllContractantNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: markAllContractantNotificationsAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantNotificationsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: contractantNotificationsKeys.unreadCount() }),
      ]);
    },
  });
}
