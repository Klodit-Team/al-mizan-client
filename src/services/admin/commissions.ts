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

export type UpdateCommissionInput = Partial<CreateCommissionInput>;

export interface ChangeCommissionStatusInput {
  statut: CommissionStatut;
}

const COMMISSIONS_MARCHE_BASE_PATH = "/api/v1/commissions-marche";

export async function getAdminCommissions(): Promise<Commission[]> {
  return apiClient<Commission[]>(`${COMMISSIONS_MARCHE_BASE_PATH}/`, {
    method: "GET",
  });
}

export async function createAdminCommission(
  payload: CreateCommissionInput,
): Promise<Commission> {
  return apiClient<Commission>(`${COMMISSIONS_MARCHE_BASE_PATH}/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminCommissionById(id: string): Promise<Commission> {
  return apiClient<Commission>(`${COMMISSIONS_MARCHE_BASE_PATH}/${id}`, {
    method: "GET",
  });
}

export async function updateAdminCommission(
  id: string,
  payload: UpdateCommissionInput,
): Promise<Commission> {
  return apiClient<Commission>(`${COMMISSIONS_MARCHE_BASE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCommission(id: string): Promise<void> {
  await apiClient<void>(`${COMMISSIONS_MARCHE_BASE_PATH}/${id}`, {
    method: "DELETE",
  });
}

export async function changeAdminCommissionStatus(
  id: string,
  payload: ChangeCommissionStatusInput,
): Promise<Commission> {
  return apiClient<Commission>(`${COMMISSIONS_MARCHE_BASE_PATH}/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
