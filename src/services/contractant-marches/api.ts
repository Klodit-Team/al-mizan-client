import { apiClient } from "@/services/client";

export type MarcheStatus = "en_cours" | "termine" | "resilie";
export type MarcheNextStatus = "termine" | "resilie";

export interface MarcheListItem {
  id: string;
  reference: string;
  object: string;
  economicOperatorName: string;
  globalAmount: string;
  signatureDate: string;
  expectedEndDate: string;
  status: MarcheStatus;
}

export interface MarcheDetail extends MarcheListItem {
  originTenderId: string;
  aoReference: string;
  executionDelayDays: number;
  economicOperatorContactName: string;
  economicOperatorContactEmail: string;
  economicOperatorContactPhone: string;
  description: string;
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    ("success" in (payload as Record<string, unknown>) || "statusCode" in (payload as Record<string, unknown>))
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

export async function listContractantMarches(): Promise<MarcheListItem[]> {
  const raw = await apiClient<unknown>(
    "/api/v1/appels-offres/marches",
    { method: "GET" },
  );
  const items = unwrapEnvelope<MarcheListItem[]>(raw);
  return Array.isArray(items) ? items : [];
}

export async function getContractantMarcheById(id: string): Promise<MarcheDetail | null> {
  try {
    const raw = await apiClient<unknown>(
      `/api/v1/appels-offres/marches/${id}`,
      { method: "GET" },
    );
    return unwrapEnvelope<MarcheDetail>(raw);
  } catch {
    return null;
  }
}

export async function updateContractantMarcheStatus(
  id: string,
  status: MarcheNextStatus,
): Promise<MarcheDetail> {
  const raw = await apiClient<unknown>(
    `/api/v1/appels-offres/marches/${id}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return unwrapEnvelope<MarcheDetail>(raw);
}
