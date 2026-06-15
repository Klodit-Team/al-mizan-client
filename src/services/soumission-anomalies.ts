import { apiClient } from "@/services/client";

export interface FlaggedBid {
  soumissionId: string;
  anomalyType: string;
  detail: string;
  confidence: number;
  detectedAt: string;
}

export interface AnomaliesParAo {
  totalAnomalies: number;
  breakdown: Record<string, number>;
  flaggedBids: FlaggedBid[];
}

export async function getAnomaliesParAo(aoId: string): Promise<AnomaliesParAo> {
  const raw = await apiClient<{ data?: AnomaliesParAo } | AnomaliesParAo>(
    `/api/v1/soumissions/appel-offre/${aoId}/anomalies`,
    { method: "GET" },
  );
  const payload = (raw as any)?.data ?? raw;
  return {
    totalAnomalies: payload?.totalAnomalies ?? 0,
    breakdown: payload?.breakdown ?? {},
    flaggedBids: Array.isArray(payload?.flaggedBids) ? payload.flaggedBids : [],
  };
}
