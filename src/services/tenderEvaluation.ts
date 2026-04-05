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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface EvaluationStoreItem {
  phases: TenderEvaluationPhaseOverviewItem[];
  details: Record<
    TenderEvaluationPhase,
    ServiceContractantTenderEvaluationPhaseDetail
  >;
}

const evaluationStore = new Map<string, EvaluationStoreItem>();

function buildDefaultEvaluation(aoId: string): EvaluationStoreItem {
  const phases: TenderEvaluationPhaseOverviewItem[] = [
    {
      phase: "eligibilite",
      label: "Eligibilite",
      status: "validee",
      updatedAt: "2026-03-18T09:15:00.000Z",
    },
    {
      phase: "technique",
      label: "Technique",
      status: "terminee",
      updatedAt: "2026-03-19T14:10:00.000Z",
    },
    {
      phase: "financiere",
      label: "Financiere",
      status: "en_cours",
      updatedAt: "2026-03-20T11:05:00.000Z",
    },
  ];

  const sharedScores: TenderEvaluationScoreRow[] = [
    {
      submissionReference: "SOUM-2026-001",
      scoreTechnique: 88,
      scoreFinancier: 86,
      scoreGlobal: 87.2,
      ranking: 1,
      decision: "retenu",
    },
    {
      submissionReference: "SOUM-2026-002",
      scoreTechnique: 84,
      scoreFinancier: 82,
      scoreGlobal: 83.2,
      ranking: 2,
      decision: "retenu",
    },
    {
      submissionReference: "SOUM-2026-003",
      scoreTechnique: 60,
      scoreFinancier: 0,
      scoreGlobal: 36,
      ranking: 3,
      decision: "elimine",
    },
  ];

  const sharedIaComparisons: TenderEvaluationIaComparisonRow[] = [
    {
      submissionReference: "SOUM-2026-001",
      commissionScore: 87.2,
      iaScore: 88,
      matches: true,
      deviation: 0.8,
      divergenceReason: "-",
    },
    {
      submissionReference: "SOUM-2026-002",
      commissionScore: 83.2,
      iaScore: 78,
      matches: false,
      deviation: 5.2,
      divergenceReason:
        "La commission a valorise des clarifications techniques recues en seance.",
    },
    {
      submissionReference: "SOUM-2026-003",
      commissionScore: 36,
      iaScore: 40,
      matches: true,
      deviation: 4,
      divergenceReason: "-",
    },
  ];

  const details: Record<
    TenderEvaluationPhase,
    ServiceContractantTenderEvaluationPhaseDetail
  > = {
    eligibilite: {
      aoId,
      phase: "eligibilite",
      label: "Eligibilite",
      status: "validee",
      scores: [...sharedScores],
      iaComparisons: [...sharedIaComparisons],
      report: {
        generated: true,
        fileName: "rapport-evaluation-eligibilite.pdf",
        fileUrl: "/documents/evaluation/rapport-evaluation-eligibilite.pdf",
      },
      canValidate: false,
      validatedAt: "2026-03-18T09:20:00.000Z",
    },
    technique: {
      aoId,
      phase: "technique",
      label: "Technique",
      status: "terminee",
      scores: [...sharedScores],
      iaComparisons: [...sharedIaComparisons],
      report: {
        generated: true,
        fileName: "rapport-evaluation-technique.pdf",
        fileUrl: "/documents/evaluation/rapport-evaluation-technique.pdf",
      },
      canValidate: true,
      validatedAt: null,
    },
    financiere: {
      aoId,
      phase: "financiere",
      label: "Financiere",
      status: "en_cours",
      scores: [...sharedScores],
      iaComparisons: [...sharedIaComparisons],
      report: {
        generated: false,
        fileName: null,
        fileUrl: null,
      },
      canValidate: false,
      validatedAt: null,
    },
  };

  return { phases, details };
}

function ensureEvaluation(aoId: string): EvaluationStoreItem {
  const existing = evaluationStore.get(aoId);
  if (existing) {
    return existing;
  }

  const seeded = buildDefaultEvaluation(aoId);
  evaluationStore.set(aoId, seeded);
  return seeded;
}

function cloneOverview(
  item: TenderEvaluationPhaseOverviewItem,
): TenderEvaluationPhaseOverviewItem {
  return { ...item };
}

function cloneDetail(
  item: ServiceContractantTenderEvaluationPhaseDetail,
): ServiceContractantTenderEvaluationPhaseDetail {
  return {
    ...item,
    scores: item.scores.map((row) => ({ ...row })),
    iaComparisons: item.iaComparisons.map((row) => ({ ...row })),
    report: { ...item.report },
  };
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

export async function listServiceContractantTenderEvaluationPhases(
  aoId: string,
): Promise<TenderEvaluationPhaseOverviewItem[]> {
  if (API_BASE_URL) {
    return requestJson<TenderEvaluationPhaseOverviewItem[]>(
      `/service-contractant/tenders/${aoId}/evaluation/phases`,
      {
        method: "GET",
      },
    );
  }

  await sleep(180);
  return ensureEvaluation(aoId).phases.map(cloneOverview);
}

export async function getServiceContractantTenderEvaluationPhaseDetail(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail | null> {
  if (API_BASE_URL) {
    try {
      return await requestJson<ServiceContractantTenderEvaluationPhaseDetail>(
        `/service-contractant/tenders/${aoId}/evaluation/phases/${phase}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(160);
  const detail = ensureEvaluation(aoId).details[phase];
  return detail ? cloneDetail(detail) : null;
}

export async function validateServiceContractantTenderEvaluationPhase(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantTenderEvaluationPhaseDetail>(
      `/service-contractant/tenders/${aoId}/evaluation/phases/${phase}/validate`,
      {
        method: "PATCH",
      },
    );
  }

  await sleep(240);

  const store = ensureEvaluation(aoId);
  const detail = store.details[phase];

  if (!detail) {
    throw new Error("Phase d'evaluation introuvable");
  }

  const nowIso = new Date().toISOString();

  detail.status = "validee";
  detail.canValidate = false;
  detail.validatedAt = nowIso;

  if (!detail.report.generated) {
    detail.report.generated = true;
    detail.report.fileName = `rapport-evaluation-${phase}.pdf`;
    detail.report.fileUrl = `/documents/evaluation/rapport-evaluation-${phase}.pdf`;
  }

  const phaseOverview = store.phases.find((item) => item.phase === phase);
  if (phaseOverview) {
    phaseOverview.status = "validee";
    phaseOverview.updatedAt = nowIso;
  }

  return cloneDetail(detail);
}
