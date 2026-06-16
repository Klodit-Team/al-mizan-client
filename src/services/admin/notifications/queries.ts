import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationsCount,
  listAlertesIA,
  getAlerteIAById,
  acquitterAlerteIA,
  resoudreAlerteIA,
  listRapportsIA,
  getRapportIAById,
  genererRapportIA,
  getNotificationPreferences,
  updateNotificationPreferences,
  type PaginatedNotifications,
  type NotificationEntity,
  type ListNotificationsParams,
  type PaginatedAlertesIA,
  type ListAlertesIAParams,
  type AlerteIAEntity,
  type PaginatedRapportsIA,
  type ListRapportsIAParams,
  type RapportIAEntity,
  type NotificationPreferences,
} from "./api";
import { notificationsKeys } from "./keys";

// ─── Notifications ─────────────────────────────────────────────────────────────

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

// ─── Alertes IA ────────────────────────────────────────────────────────────────

export function useAlertesIAQuery(params: ListAlertesIAParams) {
  return useQuery<PaginatedAlertesIA, Error>({
    queryKey: [...notificationsKeys.all, "alertes-ia", params],
    queryFn: () => listAlertesIA(params),
  });
}

export function useAcquitterAlerteMutation() {
  const queryClient = useQueryClient();
  return useMutation<AlerteIAEntity, Error, { id: string; notes: string }>({
    mutationFn: ({ id, notes }) => acquitterAlerteIA(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationsKeys.all, "alertes-ia"] });
    },
  });
}

export function useResoudreAlerteMutation() {
  const queryClient = useQueryClient();
  return useMutation<AlerteIAEntity, Error, { id: string; notes: string }>({
    mutationFn: ({ id, notes }) => resoudreAlerteIA(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationsKeys.all, "alertes-ia"] });
    },
  });
}

// ─── Rapports IA ───────────────────────────────────────────────────────────────

export function useRapportsIAQuery(params: ListRapportsIAParams) {
  return useQuery<PaginatedRapportsIA, Error>({
    queryKey: [...notificationsKeys.all, "rapports-ia", params],
    queryFn: () => listRapportsIA(params),
  });
}

export function useGenererRapportMutation() {
  const queryClient = useQueryClient();
  return useMutation<RapportIAEntity, Error, any>({
    mutationFn: genererRapportIA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationsKeys.all, "rapports-ia"] });
    },
  });
}

// ─── Preferences ───────────────────────────────────────────────────────────────

export function useNotificationPreferencesQuery() {
  return useQuery<NotificationPreferences, Error>({
    queryKey: [...notificationsKeys.all, "preferences"],
    queryFn: getNotificationPreferences,
  });
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferences, Error, Partial<NotificationPreferences> & { categoriesDesactivees?: string[] }>({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationsKeys.all, "preferences"] });
    },
  });
}
