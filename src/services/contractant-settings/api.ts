import { apiClient } from "@/services/client";

export interface ContractantSettings {
  notificationsEmail: boolean;
  notificationsSms: boolean;
  notificationsPush: boolean;
  language: "fr" | "ar";
  timezone: string;
  autoPublishAvis: boolean;
}

export async function getContractantSettings(): Promise<ContractantSettings> {
  return apiClient<ContractantSettings>(
    "/api/v1/preferences",
    { method: "GET" },
  );
}

export async function updateContractantSettings(
  payload: Partial<ContractantSettings>,
): Promise<ContractantSettings> {
  return apiClient<ContractantSettings>(
    "/api/v1/preferences",
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}
