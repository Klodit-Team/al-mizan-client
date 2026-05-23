import { apiClient } from "@/services/client";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "SERVICE_CONTRACTANT" | "OPERATEUR_ECONOMIQUE" | "MEMBRE_COMMISSION" | "CONTROLEUR";
  organisation_id: string;
  created_at: string;
  is_active: boolean;
  is_blacklisted?: boolean;
  blacklist_motif?: string;
}
const USERS_BASE_PATH = "/api/v1/users";
export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiClient<AdminUser[]>(`${USERS_BASE_PATH}/profiles`, {
    method: "GET",
  });
}

export async function updateAdminUserRole(userId: string, role: string): Promise<void> {
  await apiClient<void>(`${USERS_BASE_PATH}/user-roles/${userId}`, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}




