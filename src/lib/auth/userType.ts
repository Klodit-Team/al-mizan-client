export type DashboardUserType = "admin" | "contractant" | "operateur" | "commission";

export function mapRoleToDashboardUserType(
  role: string | null | undefined,
): DashboardUserType | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toUpperCase();

  if (normalized === "ADMIN") {
    return "admin";
  }

  if (normalized === "SERVICE_CONTRACTANT" || normalized === "CONTRACTANT") {
    return "contractant";
  }

  if (normalized === "OPERATEUR_ECONOMIQUE" || normalized === "OPERATEUR") {
    return "operateur";
  }

  if (normalized === "MEMBRE_COMMISSION" || normalized === "COMMISSION") {
    return "commission";
  }

  return null;
}

/**
 * Returns the home path for a given dashboard user type.
 * For commission members, userId is required to build the correct URL
 * (the commission dashboard is user-scoped: /dashboard/commission/[userId]/tableau-de-bord).
 */
export function getDashboardHomePath(
  locale: string,
  userType: DashboardUserType,
  userId?: string,
): string {
  if (userType === "admin") {
    return `/${locale}/dashboard/admin/tableau-de-bord`;
  }

  if (userType === "operateur") {
    return `/${locale}/dashboard/operateur/tableau-de-bord`;
  }

  if (userType === "commission") {
    if (userId) {
      return `/${locale}/dashboard/commission/${userId}/tableau-de-bord`;
    }
    // Fallback: root redirects to mes-commissions
    return `/${locale}/dashboard/commission`;
  }

  return `/${locale}/dashboard/contractant/tableau-de-bord`;
}