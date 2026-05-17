import { apiClient } from "@/services/client";

export type AdminOrgType =
  | "EPA"
  | "EPIC"
  | "MINISTERE"
  | "ENTREPRISE_PRIVEE"
  | "ENTREPRISE_PUBLIQUE"
  | "GROUPEMENT";

export interface AdminOrganisation {
  id: string;
  denomination: string;
  nif: string;
  nis: string;
  registre_commerce: string;
  adresse: string;
  wilaya: string;
  commune: string;
  type: AdminOrgType;
  email: string;
  is_verified: boolean;
  created_at: string;
}

export interface AdminOrganisationUser {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "SERVICE_CONTRACTANT" | "OPERATEUR_ECONOMIQUE" | "MEMBRE_COMMISSION" | "CONTROLEUR";
  organisation_id: string;
  created_at: string;
  is_active: boolean;
}

export interface AdminOrganisationDetails {
  organisation: AdminOrganisation;
  users: AdminOrganisationUser[];
}
const ORGANISATIONS_BASE_PATH = "/api/v1/users/organisations";

export async function getAdminOrganisations(): Promise<AdminOrganisation[]> {
  return apiClient<AdminOrganisation[]>(`${ORGANISATIONS_BASE_PATH}`, {
    method: "GET",
  });
}

export async function getAdminOrganisationById(orgId: string): Promise<AdminOrganisationDetails> {
  return apiClient<AdminOrganisationDetails>(`${ORGANISATIONS_BASE_PATH}/${orgId}`, {
    method: "GET",
  });
}

export async function verifyAdminOrganisation(orgId: string): Promise<void> {
  await apiClient<void>(`${ORGANISATIONS_BASE_PATH}/${orgId}/verify`, {
    method: "PATCH",
  });
}
