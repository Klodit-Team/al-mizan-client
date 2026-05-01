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

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiClient<AdminUser[]>("/api/admin/users", {
    method: "GET",
  });
}

export async function updateAdminUserRole(userId: string, role: string): Promise<void> {
  await apiClient<void>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function blacklistAdminUser(userId: string, motif: string): Promise<void> {
  await apiClient<void>(`/api/admin/users/${userId}/blacklist`, {
    method: "POST",
    body: JSON.stringify({ motif }),
  });
}

export async function removeAdminUserBlacklist(userId: string): Promise<void> {
  await apiClient<void>(`/api/admin/users/${userId}/blacklist`, {
    method: "DELETE",
  });
}
