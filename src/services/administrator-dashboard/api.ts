import { apiClient } from "@/services/client";

export interface AdministratorDashboardStats {
  utilisateursActifs: number;
  aoEnCours: number;
  recoursOuverts: number;
  incidentsIA: number;
}

export async function getAdministratorDashboardStats(): Promise<AdministratorDashboardStats> {
  return apiClient<AdministratorDashboardStats>("/api/dashboard/admin/stats", {
    method: "GET",
  });
}
