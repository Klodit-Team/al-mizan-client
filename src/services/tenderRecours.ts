import { apiClient } from "@/services/client";

export type TenderRecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

export type TenderRecoursDecision = "accepte" | "rejete";

export interface TenderRecoursAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface ServiceContractantTenderRecoursListItem {
  id: string;
  reference: string;
  operatorName: string;
  submittedAt: string;
  responseDeadlineAt: string;
  status: TenderRecoursStatus;
}

export interface ServiceContractantTenderRecoursDetail extends ServiceContractantTenderRecoursListItem {
  reason: string;
  attachments: TenderRecoursAttachment[];
  decision: TenderRecoursDecision | null;
  decisionReason: string | null;
  decisionDate: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrapEnvelope<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    if (("success" in rec || "statusCode" in rec) && "data" in rec) {
      return rec.data as T;
    }
  }
  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);
  if (Array.isArray(unwrapped)) return unwrapped as T[];
  if (unwrapped && typeof unwrapped === "object") {
    const rec = unwrapped as Record<string, unknown>;
    if (Array.isArray(rec.data)) return rec.data as T[];
    if (Array.isArray(rec.content)) return rec.content as T[];
    if (Array.isArray(rec.items)) return rec.items as T[];
    if (Array.isArray(rec.results)) return rec.results as T[];
    if (Array.isArray(rec.rows)) return rec.rows as T[];
  }
  return [];
}

async function getOperateursMap() {
  const raw = await apiClient<unknown>("/api/v1/operateurs-economiques?page=1&limit=500", { method: "GET" }).catch(() => null);
  const list = extractList<any>(raw);
  const map = new Map<string, string>();
  list.forEach(op => {
    map.set(op.id, op.organisation?.denomination || op.organisationId || "Opérateur Économique");
  });
  return map;
}

function mapStatus(statut: string): TenderRecoursStatus {
  const raw = (statut || "").toUpperCase();
  if (raw === "EN_EXAMEN") return "en_examen";
  if (raw === "ACCEPTE") return "accepte";
  if (raw === "REJETE") return "rejete";
  return "depose";
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function listServiceContractantTenderRecours(
  aoId: string,
): Promise<ServiceContractantTenderRecoursListItem[]> {
  try {
    const raw = await apiClient<unknown>(`/api/v1/recours/appel-offre/${aoId}`, { method: "GET" });
    const records = extractList<any>(raw);
    const opMap = await getOperateursMap();

    return records.map((record) => ({
      id: record.id,
      reference: record.reference || record.id,
      operatorName: opMap.get(record.operateurId || record.operateur_id || "") || record.operateurId || "Opérateur inconnu",
      submittedAt: record.dateDepot || record.date_depot || new Date().toISOString(),
      responseDeadlineAt: record.dateLimiteReponse || record.date_limite_reponse || new Date().toISOString(),
      status: mapStatus(record.statut || ""),
    }));
  } catch (error) {
    return [];
  }
}

export async function getServiceContractantTenderRecoursById(
  aoId: string,
  recoursId: string,
): Promise<ServiceContractantTenderRecoursDetail | null> {
  try {
    const raw = await apiClient<unknown>(`/api/v1/recours/${recoursId}`, { method: "GET" });
    const record = unwrapEnvelope<any>(raw);
    if (!record || !record.id) return null;

    const opMap = await getOperateursMap();

    const attachmentsRaw = record.piecesJointesUrls || record.pieces_jointes_urls || [];
    const attachments = attachmentsRaw.map((url: string, idx: number) => {
      const parts = url.split("/");
      return {
        id: `pj-${idx}`,
        fileName: parts[parts.length - 1] || `PieceJointe-${idx + 1}`,
        fileUrl: url,
      };
    });

    let decisionStatus: TenderRecoursDecision | null = null;
    if (record.decision) {
      decisionStatus = record.decision.toUpperCase() === "ACCEPTE" ? "accepte" : "rejete";
    }

    return {
      id: record.id,
      reference: record.reference || record.id,
      operatorName: opMap.get(record.operateurId || record.operateur_id || "") || record.operateurId || "Opérateur inconnu",
      submittedAt: record.dateDepot || record.date_depot || new Date().toISOString(),
      responseDeadlineAt: record.dateLimiteReponse || record.date_limite_reponse || new Date().toISOString(),
      status: mapStatus(record.statut || ""),
      reason: record.motif || "Aucun motif renseigné",
      attachments,
      decision: decisionStatus,
      decisionReason: record.motifDecision || null,
      decisionDate: record.dateDecision || null,
    };
  } catch (error) {
    return null;
  }
}