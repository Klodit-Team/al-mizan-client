import { apiClient } from "@/services/client";

export type TenderEvaluationPhase = "eligibilite" | "technique" | "financiere";
export type TenderEvaluationPhaseStatus = "en_cours" | "terminee" | "validee";
export type TenderEvaluationDecision = "retenu" | "elimine";

export interface TenderEvaluationPhaseOverviewItem {
  phase: TenderEvaluationPhase;
  label: string;
  status: TenderEvaluationPhaseStatus;
  updatedAt: string;
}

export interface TenderEvaluationScoreRow {
  submissionReference: string;
  scoreTechnique: number;
  scoreFinancier: number;
  scoreGlobal: number;
  ranking: number;
  decision: TenderEvaluationDecision;
}

export interface TenderEvaluationIaComparisonRow {
  submissionReference: string;
  commissionScore: number;
  iaScore: number;
  matches: boolean;
  deviation: number;
  divergenceReason: string;
}

export interface TenderEvaluationReport {
  generated: boolean;
  fileName: string | null;
  fileUrl: string | null;
}

export interface ServiceContractantTenderEvaluationPhaseDetail {
  aoId: string;
  phase: TenderEvaluationPhase;
  label: string;
  status: TenderEvaluationPhaseStatus;
  scores: TenderEvaluationScoreRow[];
  iaComparisons: TenderEvaluationIaComparisonRow[];
  report: TenderEvaluationReport;
  canValidate: boolean;
  validatedAt: string | null;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiClient<unknown>(path, init).catch(() => null);
  if (!response) throw new Error("Request failed");
  if (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data)) {
    return (response as any).data as T;
  }
  return response as T;
}

function mapEvalStatus(statut: string): TenderEvaluationPhaseStatus {
  const raw = (statut || "").toUpperCase();
  if (raw === "TERMINEE" || raw === "VALIDEE") return "terminee";
  return "en_cours";
}

export async function listServiceContractantTenderEvaluationPhases(
  aoId: string,
): Promise<TenderEvaluationPhaseOverviewItem[]> {
  try {
    const list = await requestJson<any[]>(`/api/v1/evaluations?appelOffreId=${aoId}`, { method: "GET" }).catch(() => []);
    
    const elig = list.find((e: any) => e.type === "ELIGIBILITE");
    const tech = list.find((e: any) => e.type === "TECHNIQUE");
    const fin = list.find((e: any) => e.type === "FINANCIERE");

    return [
      { phase: "eligibilite", label: "Éligibilité", status: elig ? mapEvalStatus(elig.statut) : "en_cours", updatedAt: elig?.updatedAt || new Date().toISOString() },
      { phase: "technique", label: "Technique", status: tech ? mapEvalStatus(tech.statut) : "en_cours", updatedAt: tech?.updatedAt || new Date().toISOString() },
      { phase: "financiere", label: "Financière", status: fin ? mapEvalStatus(fin.statut) : "en_cours", updatedAt: fin?.updatedAt || new Date().toISOString() },
    ];
  } catch {
    return [];
  }
}

export async function getServiceContractantTenderEvaluationPhaseDetail(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail | null> {
  try {
    const typeEnum = phase === "eligibilite" ? "ELIGIBILITE" : phase === "technique" ? "TECHNIQUE" : "FINANCIERE";
    const list = await requestJson<any[]>(`/api/v1/evaluations?appelOffreId=${aoId}&type=${typeEnum}`, { method: "GET" });
    const evaluation = list[0];

    if (!evaluation) return null;

    return {
      aoId,
      phase,
      label: phase === "eligibilite" ? "Éligibilité" : phase === "technique" ? "Technique" : "Financière",
      status: mapEvalStatus(evaluation.statut),
      scores: (evaluation.resultats || []).map((res: any) => ({
         submissionReference: res.evaluationSubmission?.externalSubmissionId || res.evaluationSubmissionId,
         scoreTechnique: res.scoreTechnique || 0,
         scoreFinancier: res.scoreFinancier || 0,
         scoreGlobal: res.scoreGlobal || 0,
         ranking: res.rang || 0,
         decision: res.recommandation === "RETENIR" ? "retenu" : "elimine"
      })),
      iaComparisons: [], 
      report: {
         generated: !!evaluation.rapports?.length,
         fileName: evaluation.rapports?.[0]?.fileName || null,
         fileUrl: evaluation.rapports?.[0]?.storageUrl || null
      },
      canValidate: evaluation.statut === "TERMINEE" || evaluation.statut === "VALIDEE",
      validatedAt: evaluation.validatedAt || null
    };
  } catch {
    return null;
  }
}

export async function validateServiceContractantTenderEvaluationPhase(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail> {
    const typeEnum = phase === "eligibilite" ? "ELIGIBILITE" : phase === "technique" ? "TECHNIQUE" : "FINANCIERE";
    const list = await requestJson<any[]>(`/api/v1/evaluations?appelOffreId=${aoId}&type=${typeEnum}`, { method: "GET" });
    const evaluation = list[0];

    if (!evaluation) throw new Error("Evaluation introuvable");

    await apiClient<unknown>(`/api/v1/evaluations/${evaluation.id}/statut`, {
      method: "PATCH",
      body: JSON.stringify({ statut: "VALIDEE" }),
    });

    const refreshed = await getServiceContractantTenderEvaluationPhaseDetail(aoId, phase);
    if(!refreshed) throw new Error("Erreur de rafraichissement");
    return refreshed;
}