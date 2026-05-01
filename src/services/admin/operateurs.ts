import { apiClient } from "@/services/client";

export interface AdminOperateur {
  id: string;
  organisation_id: string;
  user_id: string;
  qualifications?: string[];
  categories?: string[];
  is_eligible: boolean;
  is_blacklisted: boolean;
  // Optional enriched fields from user table
  username?: string;
  email?: string;
  role?: "ADMIN" | "SERVICE_CONTRACTANT" | "OPERATEUR_ECONOMIQUE" | "MEMBRE_COMMISSION" | "CONTROLEUR";
  created_at?: string;
  is_active?: boolean;
  blacklist_motif?: string;
}

export async function getAdminOperateurs(): Promise<AdminOperateur[]> {
  return apiClient<AdminOperateur[]>("/users/operateurs-economiques", {
    method: "GET",
  });
}

export async function blacklistAdminOperateur(userId: string, motif: string): Promise<void> {
  await apiClient<void>(`/users/operateurs-economiques/${userId}/blacklist`, {
    method: "PATCH",
    body: JSON.stringify({ motif }),
  });
}

export async function unblacklistAdminOperateur(userId: string): Promise<void> {
  await apiClient<void>(`/users/operateurs-economiques/${userId}/unblacklist`, {
    method: "PATCH",
  });
}
