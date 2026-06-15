import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationsCount,
  type PaginatedNotifications,
  type NotificationEntity,
  type ListNotificationsParams,
} from "./api";
import { notificationsKeys } from "./keys";

export function useNotificationsQuery(params: ListNotificationsParams) {
  return useQuery<PaginatedNotifications, Error>({
    queryKey: notificationsKeys.list(params),
    queryFn: () => listNotifications(params),
  });
}

export function useUnreadNotificationsCountQuery() {
  return useQuery<{ count: number }, Error>({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: getUnreadNotificationsCount,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotificationEntity, Error, string>({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, void>({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
}
