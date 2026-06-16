export const adminKeys = {
  all: ["admin"] as const,

  // Organisations
  organisations: () => [...adminKeys.all, "organisations"] as const,
  organisationList: (filters: Record<string, any>) => [...adminKeys.organisations(), "list", filters] as const,
  organisationDetail: (id: string) => [...adminKeys.organisations(), "detail", id] as const,

  // Commissions
  commissions: () => [...adminKeys.all, "commissions"] as const,
  commissionList: () => [...adminKeys.commissions(), "list"] as const,

  // Incidents
  incidents: () => [...adminKeys.all, "incidents"] as const,
  incidentList: (filters: Record<string, any>) => [...adminKeys.incidents(), "list", filters] as const,

  // Audit Logs
  audit: () => [...adminKeys.all, "audit"] as const,
  auditList: (filters: Record<string, any>) => [...adminKeys.audit(), "list", filters] as const,
  integrityStatus: () => [...adminKeys.audit(), "integrityStatus"] as const,

  // Users
  users: () => [...adminKeys.all, "users"] as const,
  userProfiles: () => [...adminKeys.users(), "profiles"] as const,
  userRoles: () => [...adminKeys.users(), "roles"] as const,
  userAssignedRoles: (userId: string) => [...adminKeys.users(), "assigned-roles", userId] as const,

  // Operateurs
  operateurs: () => [...adminKeys.all, "operateurs"] as const,
  operateurList: () => [...adminKeys.operateurs(), "list"] as const,

  // Notifications
  notifications: () => [...adminKeys.all, "notifications"] as const,
  notificationList: (filters: Record<string, any>) => [...adminKeys.notifications(), "list", filters] as const,
  unreadNotificationsCount: () => [...adminKeys.notifications(), "unreadCount"] as const,
};
