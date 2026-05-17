export const administratorDashboardKeys = {
  all: ["administrator-dashboard"] as const,
  details: () => [...administratorDashboardKeys.all, "details"] as const,
  stats: () => [...administratorDashboardKeys.all, "stats"] as const,
  activities: () => [...administratorDashboardKeys.all, "activities"] as const,
  aiAlerts: () => [...administratorDashboardKeys.all, "ai-alerts"] as const,
  deadlines: () => [...administratorDashboardKeys.all, "deadlines"] as const,
  supportLinks: () => [...administratorDashboardKeys.all, "support-links"] as const,
};
