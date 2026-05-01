import { apiClient } from "@/services/client";

export type CommissionType = "EVALUATION" | "MARCHE";
export type CommissionNiveau = "NATIONALE" | "SECTORIELLE" | "WILAYA" | "COMMUNALE";
export type CommissionStatut = "CONSTITUEE" | "ACTIVE" | "DISSOUTE";

export interface Commission {
  id: string;
  appel_offre_id?: string;
  type: CommissionType;
  designation: string;
  niveau: CommissionNiveau;
  statut: CommissionStatut;
  date_constitution: string;
  created_at: string;
}

export interface CreateCommissionInput {
  designation: string;
  type: CommissionType;
  niveau: CommissionNiveau;
  appel_offre_id?: string;
}

export async function getAdminCommissions(): Promise<Commission[]> {
  return apiClient<Commission[]>("/api/admin/commissions", {
    method: "GET",
  });
}

export async function createAdminCommission(
  payload: CreateCommissionInput,
): Promise<Commission> {
  return apiClient<Commission>("/api/admin/commissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
