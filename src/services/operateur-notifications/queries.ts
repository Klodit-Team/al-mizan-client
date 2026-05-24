import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listOperateurNotifications,
  getOperateurUnreadCount,
  markOperateurNotificationAsRead,
  markAllOperateurNotificationsAsRead,
  type OperateurNotificationItem,
  type OperateurUnreadCount,
} from "./api";
import { operateurNotificationsKeys } from "./keys";

export function useOperateurNotificationsQuery() {
  return useQuery<OperateurNotificationItem[], Error>({
    queryKey: operateurNotificationsKeys.list(),
    queryFn: listOperateurNotifications,
  });
}

export function useOperateurUnreadCountQuery() {
  return useQuery<OperateurUnreadCount, Error>({
    queryKey: operateurNotificationsKeys.unreadCount(),
    queryFn: getOperateurUnreadCount,
  });
}

export function useMarkOperateurNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: markOperateurNotificationAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operateurNotificationsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: operateurNotificationsKeys.unreadCount() }),
      ]);
    },
  });
}

export function useMarkAllOperateurNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: markAllOperateurNotificationsAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operateurNotificationsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: operateurNotificationsKeys.unreadCount() }),
      ]);
    },
  });
}
