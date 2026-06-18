import { apiClient } from "@/services/client";

export type TenderAttributionStatus = "publiee" | "en_recours" | "confirmee" | "annulee";

export interface TenderEligibleSubmission {
  submissionId: string;
  reference: string;
  operatorOrganizationName: string;
  scoreGlobal: number;
  offeredAmount: string;
}

export interface TenderProvisionalAttribution {
  id: string;
  selectedSubmissionId: string;
  selectedSubmissionReference: string;
  selectedOperatorName: string;
  attributedAmount: string;
  reason: string;
  attributionDate: string;
  recoursEndDate: string;
  notificationsTriggeredAt: string;
  notificationsRecipients: number;
  cancelledAt: string | null;
}

export interface TenderMarcheRecord {
  reference: string;
  globalAmount: string;
  signatureDate: string;
  executionDelayDays: string;
  expectedEndDate: string;
}

export interface TenderDefinitiveAttribution {
  id: string;
  linkedProvisionalAttributionId: string;
  selectedSubmissionId: string;
  selectedSubmissionReference: string;
  selectedOperatorName: string;
  attributedAmount: string;
  confirmedAt: string;
  marche: TenderMarcheRecord;
}

export interface ServiceContractantTenderAttributionOverview {
  aoId: string;
  eligibleSubmissions: TenderEligibleSubmission[];
  provisionalAttribution: TenderProvisionalAttribution | null;
  definitiveAttribution: TenderDefinitiveAttribution | null;
  hasBlockingRecours: boolean;
  status: TenderAttributionStatus | null;
  countdownDaysToRecoursEnd: number | null;
  canConfirmDefinitive: boolean;
  definitiveConditionMessage: string;
}

export interface PronounceProvisionalAttributionPayload {
  selectedSubmissionId: string;
  attributedAmount: string;
  reason: string;
  attributionDate: string;
}

export interface ConfirmDefinitiveAttributionPayload {
  signatureDate: string;
  executionDelayDays: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiClient<unknown>(path, init).catch(() => null);
  if (!response) throw new Error("Request failed");
  
  const rec = response as Record<string, any>;
  if (rec && typeof rec === "object") {
    if (("success" in rec || "statusCode" in rec) && "data" in rec) {
      return rec.data as T;
    }
    if ("data" in rec && Array.isArray(rec.data)) {
      return rec.data as T;
    }
  }
  return response as T;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getServiceContractantTenderAttributionOverview(
  aoId: string,
): Promise<ServiceContractantTenderAttributionOverview> {
  try {
    // 1. Fetch eligible submissions from evaluations
    const evals = await requestJson<any[]>(`/api/v1/evaluations?appelOffreId=${aoId}`, { method: "GET" }).catch(() => []);
    let eligibleSubmissions: TenderEligibleSubmission[] = [];
    
    const sortedEvals = evals.sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortedEvals.length > 0) {
        const finalEval = sortedEvals[0];
        eligibleSubmissions = (finalEval.resultats || [])
            .filter((r: any) => r.recommandation === "RETENIR")
            .map((r: any) => ({
                submissionId: r.evaluationSubmission?.externalSubmissionId || r.evaluationSubmissionId,
                reference: r.evaluationSubmission?.externalSubmissionId || r.evaluationSubmissionId,
                operatorOrganizationName: r.evaluationSubmission?.operateurNom || "Opérateur",
                scoreGlobal: r.scoreGlobal || 0,
                offeredAmount: String(r.evaluationSubmission?.montantOffre || "0")
            })).sort((a: any, b: any) => b.scoreGlobal - a.scoreGlobal);
    }

    // 2. Fetch attributions
    const attrs = await requestJson<any[]>(`/api/v1/attributions`, { method: "GET" }).catch(() => []);
    const aoAttrs = attrs.filter((a: any) => a.aoId === aoId);
    const prov = aoAttrs.find((a: any) => a.type === "PROVISOIRE");
    const def = aoAttrs.find((a: any) => a.type === "DEFINITIVE");

    // 3. Fetch recours
    const recours = await requestJson<any[]>(`/api/v1/recours/appel-offre/${aoId}`, { method: "GET" }).catch(()=>[]);
    const hasBlockingRecours = recours.some((r: any) => r.statut === "DEPOSE" || r.statut === "EN_EXAMEN");

    let provisionalAttribution = null;
    if (prov) {
        const submission = eligibleSubmissions.find(s => s.submissionId === prov.soumissionId) || { reference: prov.soumissionId, operatorOrganizationName: "Opérateur" };
        provisionalAttribution = {
            id: prov.id,
            selectedSubmissionId: prov.soumissionId,
            selectedSubmissionReference: submission.reference,
            selectedOperatorName: submission.operatorOrganizationName,
            attributedAmount: String(prov.montantAttribue),
            reason: "Attribution basée sur le classement final",
            attributionDate: prov.dateAttribution,
            recoursEndDate: prov.dateFinRecours,
            notificationsTriggeredAt: prov.dateAttribution,
            notificationsRecipients: eligibleSubmissions.length,
            cancelledAt: null
        };
    }

    let definitiveAttribution = null;
    if (def) {
        const submission = eligibleSubmissions.find(s => s.submissionId === def.soumissionId) || { reference: def.soumissionId, operatorOrganizationName: "Opérateur" };
        const marches = await requestJson<any[]>(`/api/v1/marches`, { method: "GET" }).catch(()=>[]);
        const marche = marches.find((m: any) => m.attributionId === def.id);

        definitiveAttribution = {
            id: def.id,
            linkedProvisionalAttributionId: prov?.id || "",
            selectedSubmissionId: def.soumissionId,
            selectedSubmissionReference: submission.reference,
            selectedOperatorName: submission.operatorOrganizationName,
            attributedAmount: String(def.montantAttribue),
            confirmedAt: def.dateAttribution,
            marche: {
                reference: marche?.referenceMarche || "N/A",
                globalAmount: String(marche?.montantSigne || def.montantAttribue),
                signatureDate: marche?.dateSignature || def.dateAttribution,
                executionDelayDays: String(marche?.delaiExecution || "0"),
                expectedEndDate: marche?.dateSignature || def.dateAttribution
            }
        };
    }

    let status: TenderAttributionStatus | null = null;
    let countdownDaysToRecoursEnd: number | null = null;
    let canConfirmDefinitive = false;
    let definitiveConditionMessage = "Attribution definitive indisponible: attribution provisoire non prononcee.";

    if (provisionalAttribution) {
        if (definitiveAttribution) {
            status = "confirmee";
            definitiveConditionMessage = "Attribution definitive deja confirmee.";
        } else {
            const target = new Date(`${provisionalAttribution.recoursEndDate.slice(0,10)}T23:59:59.999Z`);
            const daysRemaining = Math.ceil((target.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            
            if (daysRemaining > 0) {
                status = "en_recours";
                countdownDaysToRecoursEnd = daysRemaining;
                definitiveConditionMessage = "Attribution definitive disponible apres expiration du delai de recours.";
            } else {
                status = "publiee";
                if (hasBlockingRecours) {
                    definitiveConditionMessage = "Attribution definitive bloquee: recours bloquant en cours.";
                } else {
                    canConfirmDefinitive = true;
                    definitiveConditionMessage = "Conditions remplies: vous pouvez confirmer l'attribution definitive.";
                }
            }
        }
    }

    return {
        aoId,
        eligibleSubmissions,
        provisionalAttribution,
        definitiveAttribution,
        hasBlockingRecours,
        status,
        countdownDaysToRecoursEnd,
        canConfirmDefinitive,
        definitiveConditionMessage
    };
  } catch (err) {
      throw new Error("Impossible de charger les informations d'attribution.");
  }
}

export async function pronounceServiceContractantProvisionalAttribution(
  aoId: string,
  payload: PronounceProvisionalAttributionPayload,
): Promise<ServiceContractantTenderAttributionOverview> {
  const dateAttribution = new Date(payload.attributionDate);
  dateAttribution.setDate(dateAttribution.getDate() + 10);

  await apiClient<unknown>("/api/v1/attributions", {
    method: "POST",
    body: JSON.stringify({ 
        aoId, 
        soumissionId: payload.selectedSubmissionId, 
        type: "PROVISOIRE",
        dateAttribution: new Date(payload.attributionDate).toISOString(),
        dateFinRecours: dateAttribution.toISOString(),
        montantAttribue: Number(payload.attributedAmount.replace(/\s/g, '').replace(',', '.'))
    }),
  });
  return getServiceContractantTenderAttributionOverview(aoId);
}

export async function confirmServiceContractantDefinitiveAttribution(
  aoId: string,
  payload: ConfirmDefinitiveAttributionPayload,
): Promise<ServiceContractantTenderAttributionOverview> {
  const overview = await getServiceContractantTenderAttributionOverview(aoId);
  const prov = overview.provisionalAttribution;
  if(!prov) throw new Error("Attribution provisoire manquante");

  const defAttrRaw = await apiClient<any>("/api/v1/attributions", {
    method: "POST",
    body: JSON.stringify({ 
        aoId, 
        soumissionId: prov.selectedSubmissionId, 
        type: "DEFINITIVE", 
        dateAttribution: new Date().toISOString(), 
        dateFinRecours: new Date().toISOString(), 
        montantAttribue: Number(prov.attributedAmount) 
    }),
  });
  const defAttr = defAttrRaw.data || defAttrRaw;

  await apiClient<unknown>("/api/v1/marches", {
    method: "POST",
    body: JSON.stringify({ 
        aoId, 
        attributionId: defAttr.id, 
        referenceMarche: `M-${Date.now()}`, 
        montantSigne: Number(prov.attributedAmount), 
        dateSignature: new Date(payload.signatureDate).toISOString(), 
        delaiExecution: Number(payload.executionDelayDays) 
    }),
  });

  return getServiceContractantTenderAttributionOverview(aoId);
}

export function computeRecoursEndDateFromAttributionDate(attributionDate: string): string {
  const date = new Date(attributionDate);
  if (Number.isNaN(date.getTime())) return attributionDate;
  date.setDate(date.getDate() + 10);
  return date.toISOString().slice(0, 10);
}