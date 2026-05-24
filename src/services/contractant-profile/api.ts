import { apiClient } from "@/services/client";

export type ProfileLanguage = "fr" | "ar";
export type OrganizationVerificationStatus =
  | "verifie"
  | "en_attente"
  | "non_verifie";

export interface ContractantUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: ProfileLanguage;
}

export interface ContractantOrganizationInfo {
  denomination: string;
  nif: string;
  nis: string;
  rc: string;
  address: string;
  wilaya: string;
  organizationType: string;
  verificationStatus: OrganizationVerificationStatus;
}

export interface ContractantServiceInfo {
  serviceCode: string;
  activitySector: string;
  ordonnateur: string;
}

export interface ContractantProfile {
  userInfo: ContractantUserInfo;
  organizationInfo: ContractantOrganizationInfo;
  serviceInfo: ContractantServiceInfo;
}

export async function getContractantProfile(): Promise<ContractantProfile> {
  return apiClient<ContractantProfile>(
    "/api/v1/users/services-contractants/profile",
    { method: "GET" },
  );
}

export async function updateContractantProfile(
  payload: ContractantProfile,
): Promise<ContractantProfile> {
  return apiClient<ContractantProfile>(
    "/api/v1/users/services-contractants/profile",
    { method: "PUT", body: JSON.stringify(payload) },
  );
}
