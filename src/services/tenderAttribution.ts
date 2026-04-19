export type TenderAttributionStatus =
  | "publiee"
  | "en_recours"
  | "confirmee"
  | "annulee";

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

interface AttributionStoreItem {
  aoId: string;
  eligibleSubmissions: TenderEligibleSubmission[];
  provisionalAttribution: TenderProvisionalAttribution | null;
  definitiveAttribution: TenderDefinitiveAttribution | null;
  hasBlockingRecours: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const attributionStore = new Map<string, AttributionStoreItem>();

function toDateOnlyIso(input: string): string {
  return input.slice(0, 10);
}

function addDays(dateIso: string, days: number): string {
  const date = new Date(`${toDateOnlyIso(dateIso)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return toDateOnlyIso(dateIso);
  }

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function diffDaysFromNow(targetDateIso: string): number {
  const now = new Date();
  const target = new Date(`${toDateOnlyIso(targetDateIso)}T23:59:59.999Z`);
  if (Number.isNaN(target.getTime())) {
    return 0;
  }

  const msDiff = target.getTime() - now.getTime();
  return Math.ceil(msDiff / (24 * 60 * 60 * 1000));
}

function cloneOverview(
  item: AttributionStoreItem,
): ServiceContractantTenderAttributionOverview {
  const provisional = item.provisionalAttribution
    ? { ...item.provisionalAttribution }
    : null;
  const definitive = item.definitiveAttribution
    ? {
        ...item.definitiveAttribution,
        marche: { ...item.definitiveAttribution.marche },
      }
    : null;

  let status: TenderAttributionStatus | null = null;
  let countdownDaysToRecoursEnd: number | null = null;
  let canConfirmDefinitive = false;
  let definitiveConditionMessage =
    "Attribution definitive indisponible: attribution provisoire non prononcee.";

  if (provisional) {
    if (provisional.cancelledAt) {
      status = "annulee";
      definitiveConditionMessage =
        "Attribution definitive indisponible: attribution provisoire annulee.";
    } else if (definitive) {
      status = "confirmee";
      definitiveConditionMessage = "Attribution definitive deja confirmee.";
    } else {
      const daysRemaining = diffDaysFromNow(provisional.recoursEndDate);
      if (daysRemaining > 0) {
        status = "en_recours";
        countdownDaysToRecoursEnd = daysRemaining;
        definitiveConditionMessage =
          "Attribution definitive disponible apres expiration du delai de recours.";
      } else {
        status = "publiee";
        if (item.hasBlockingRecours) {
          definitiveConditionMessage =
            "Attribution definitive bloquee: recours bloquant en cours.";
        } else {
          canConfirmDefinitive = true;
          definitiveConditionMessage =
            "Conditions remplies: vous pouvez confirmer l'attribution definitive.";
        }
      }
    }
  }

  return {
    aoId: item.aoId,
    eligibleSubmissions: item.eligibleSubmissions.map((entry) => ({
      ...entry,
    })),
    provisionalAttribution: provisional,
    definitiveAttribution: definitive,
    hasBlockingRecours: item.hasBlockingRecours,
    status,
    countdownDaysToRecoursEnd,
    canConfirmDefinitive,
    definitiveConditionMessage,
  };
}

function ensureAttribution(aoId: string): AttributionStoreItem {
  const existing = attributionStore.get(aoId);
  if (existing) {
    return existing;
  }

  const seeded: AttributionStoreItem = {
    aoId,
    eligibleSubmissions: [
      {
        submissionId: `${aoId}-SOUM-001`,
        reference: "SOUM-2026-001",
        operatorOrganizationName: "Sari TechSolutions",
        scoreGlobal: 87.2,
        offeredAmount: "45 220 000",
      },
      {
        submissionId: `${aoId}-SOUM-002`,
        reference: "SOUM-2026-002",
        operatorOrganizationName: "Global Network SA",
        scoreGlobal: 83.2,
        offeredAmount: "46 648 000",
      },
      {
        submissionId: `${aoId}-SOUM-004`,
        reference: "SOUM-2026-004",
        operatorOrganizationName: "EURL Data Protect",
        scoreGlobal: 79.5,
        offeredAmount: "47 100 000",
      },
    ],
    provisionalAttribution: null,
    definitiveAttribution: null,
    hasBlockingRecours: false,
  };

  attributionStore.set(aoId, seeded);
  return seeded;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getServiceContractantTenderAttributionOverview(
  aoId: string,
): Promise<ServiceContractantTenderAttributionOverview> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantTenderAttributionOverview>(
      `/service-contractant/tenders/${aoId}/attribution/overview`,
      {
        method: "GET",
      },
    );
  }

  await sleep(180);
  return cloneOverview(ensureAttribution(aoId));
}

export async function pronounceServiceContractantProvisionalAttribution(
  aoId: string,
  payload: PronounceProvisionalAttributionPayload,
): Promise<ServiceContractantTenderAttributionOverview> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantTenderAttributionOverview>(
      `/service-contractant/tenders/${aoId}/attribution/provisional`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(260);

  const store = ensureAttribution(aoId);
  const selected = store.eligibleSubmissions.find(
    (entry) => entry.submissionId === payload.selectedSubmissionId,
  );

  if (!selected) {
    throw new Error("Soumission selectionnee introuvable");
  }

  const attributionDate = toDateOnlyIso(payload.attributionDate);
  const recoursEndDate = addDays(attributionDate, 10);

  store.provisionalAttribution = {
    id: `ATTR-PROV-${Date.now()}`,
    selectedSubmissionId: selected.submissionId,
    selectedSubmissionReference: selected.reference,
    selectedOperatorName: selected.operatorOrganizationName,
    attributedAmount: payload.attributedAmount,
    reason: payload.reason,
    attributionDate,
    recoursEndDate,
    notificationsTriggeredAt: new Date().toISOString(),
    notificationsRecipients: store.eligibleSubmissions.length,
    cancelledAt: null,
  };

  store.definitiveAttribution = null;

  return cloneOverview(store);
}

export async function confirmServiceContractantDefinitiveAttribution(
  aoId: string,
  payload: ConfirmDefinitiveAttributionPayload,
): Promise<ServiceContractantTenderAttributionOverview> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantTenderAttributionOverview>(
      `/service-contractant/tenders/${aoId}/attribution/definitive`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(300);

  const store = ensureAttribution(aoId);
  const overview = cloneOverview(store);

  if (!overview.provisionalAttribution) {
    throw new Error("Attribution provisoire inexistante");
  }

  if (!overview.canConfirmDefinitive) {
    throw new Error(overview.definitiveConditionMessage);
  }

  const provisional = overview.provisionalAttribution;
  const year = new Date().getFullYear();
  const serial = String(Math.floor(100 + Math.random() * 900));
  const signatureDate = toDateOnlyIso(payload.signatureDate);
  const executionDelayDays = payload.executionDelayDays;
  const expectedEndDate = addDays(
    signatureDate,
    Number.parseInt(executionDelayDays || "0", 10) || 0,
  );

  store.definitiveAttribution = {
    id: `ATTR-DEF-${Date.now()}`,
    linkedProvisionalAttributionId: provisional.id,
    selectedSubmissionId: provisional.selectedSubmissionId,
    selectedSubmissionReference: provisional.selectedSubmissionReference,
    selectedOperatorName: provisional.selectedOperatorName,
    attributedAmount: provisional.attributedAmount,
    confirmedAt: new Date().toISOString(),
    marche: {
      reference: `M-${year}-${serial}`,
      globalAmount: provisional.attributedAmount,
      signatureDate,
      executionDelayDays,
      expectedEndDate,
    },
  };

  return cloneOverview(store);
}

export function computeRecoursEndDateFromAttributionDate(
  attributionDate: string,
): string {
  return addDays(attributionDate, 10);
}
