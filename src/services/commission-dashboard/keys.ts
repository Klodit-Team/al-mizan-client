export const commissionDashboardKeys = {
  all: ["commission-dashboard"] as const,
  details: () => [...commissionDashboardKeys.all, "details"] as const,
};
