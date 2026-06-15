// Re-export all mutations from submodules
export { useVerifyIntegrityMutation } from "./audit/queries";
export {
  useCreateCommissionMutation,
  useUpdateCommissionMutation,
  useDeleteCommissionMutation,
  useUpdateCommissionStatusMutation,
} from "./commissions/queries";
export {
  useUpdateIncidentStatusMutation,
  useResolveIncidentMutation,
} from "./incidents/queries";
export {
  useVerifyOrganisationMutation,
  useUpdateOrganisationMutation,
  useDeleteOrganisationMutation,
} from "./organisations/queries";
export {
  useCreateUserProfileMutation,
  useUpdateUserProfileMutation,
  useDeleteUserProfileMutation,
  useAssignUserRoleMutation,
} from "./users/queries";
export { useUpdateAdminProfileMutation } from "./profile/queries";
export {
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "./notifications/queries";
export {
  useBlacklistOperateurMutation,
  useUnblacklistOperateurMutation,
} from "./operateurs/queries";
export { useRevokeSessionMutation } from "./sessions/queries";
