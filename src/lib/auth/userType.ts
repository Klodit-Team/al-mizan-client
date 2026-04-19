export type DashboardUserType = "admin" | "contractant" | "operateur";

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

  return null;
}

export function getDashboardHomePath(locale: string, userType: DashboardUserType): string {
  if (userType === "admin") {
    return `/${locale}/dashboard/admin/tableau-de-bord`;
  }

  if (userType === "operateur") {
    return `/${locale}/dashboard/operateur/tableau-de-bord`;
  }

  return `/${locale}/dashboard/contractant/tableau-de-bord`;
}