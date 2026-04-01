export type ServiceContractantTenderType = "ouvert" | "restreint" | "gre_a_gre";
export type ServiceContractantTenderStatus =
  | "brouillon"
  | "publie"
  | "en_cours"
  | "evaluation"
  | "attribue"
  | "annule";

export interface ServiceContractantTenderItem {
  id: string;
  reference: string;
  object: string;
  type: ServiceContractantTenderType;
  deadline: string;
  status: ServiceContractantTenderStatus;
}

export interface TenderLotPayload {
  lotNumber: string;
  designation: string;
  description: string;
  estimatedAmount: string;
  delayDays: string;
}

export interface TenderCriterionPayload {
  order: number;
  designation: string;
  description: string;
  eliminatory: boolean;
}

export interface TenderEvaluationCriterionPayload {
  order: number;
  designation: string;
  type: "technique" | "financier";
  weighting: string;
  eliminationScore: string;
  lotAssignment: string;
}

export interface SaveTenderDraftPayload {
  id?: string;
  reference: string;
  object: string;
  description: string;
  marketType: string;
  procedureType: string;
  estimatedAmount: string;
  executionWilaya: string;
  executionDelayDays: string;
  submissionBondRequired: boolean;
  submissionBondAmount: string;
  dceDeadline: string;
  offerDeadline: string;
  openingDate: string;
  cdc: {
    title: string;
    version: string;
    withdrawalPrice: string;
    isPublished: boolean;
    fileName?: string;
  };
  lots: TenderLotPayload[];
  eligibilityCriteria: TenderCriterionPayload[];
  evaluationCriteria: TenderEvaluationCriterionPayload[];
}

export interface PublishTenderPayload {
  id?: string;
  draft: SaveTenderDraftPayload;
}

export interface ServiceContractantTenderDraft extends SaveTenderDraftPayload {
  id: string;
}

export interface TenderMutationResult {
  id: string;
  reference: string;
  status: ServiceContractantTenderStatus;
  avisReference?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockedTenders: ServiceContractantTenderItem[] = [
  {
    id: "AO-2023-001",
    reference: "AO-2023-001",
    object: "Maintenance des serveurs data center",
    type: "ouvert",
    deadline: "2023-10-25",
    status: "brouillon",
  },
  {
    id: "AO-2023-002",
    reference: "AO-2023-002",
    object: "Fourniture de mobilier de bureau",
    type: "restreint",
    deadline: "2023-12-12",
    status: "publie",
  },
  {
    id: "AO-2023-003",
    reference: "AO-2023-003",
    object: "Nettoyage et entretien des locaux",
    type: "gre_a_gre",
    deadline: "2023-11-05",
    status: "en_cours",
  },
  {
    id: "AO-2023-004",
    reference: "AO-2023-004",
    object: "Audit de securite informatique annuel",
    type: "ouvert",
    deadline: "2023-09-30",
    status: "attribue",
  },
  {
    id: "AO-2023-005",
    reference: "AO-2023-005",
    object: "Acquisition de licences logicielles",
    type: "restreint",
    deadline: "2023-10-10",
    status: "evaluation",
  },
  {
    id: "AO-2023-006",
    reference: "AO-2023-006",
    object: "Travaux de rehabilitation energetique",
    type: "ouvert",
    deadline: "2023-08-15",
    status: "annule",
  },
];

const draftStore = new Map<string, SaveTenderDraftPayload>();

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

function buildDeadline(payload: SaveTenderDraftPayload) {
  return (
    payload.offerDeadline ||
    payload.dceDeadline ||
    new Date().toISOString().slice(0, 10)
  );
}

function mapProcedureType(value: string): ServiceContractantTenderItem["type"] {
  if (value === "restreint" || value === "gre_a_gre") {
    return value;
  }

  return "ouvert";
}

function mapTenderTypeToProcedureType(
  type: ServiceContractantTenderType,
): string {
  if (type === "restreint" || type === "gre_a_gre") {
    return type;
  }

  return "ouvert";
}

function buildDefaultDraftFromTender(
  tender: ServiceContractantTenderItem,
): ServiceContractantTenderDraft {
  return {
    id: tender.id,
    reference: tender.reference,
    object: tender.object,
    description: "",
    marketType: "",
    procedureType: mapTenderTypeToProcedureType(tender.type),
    estimatedAmount: "",
    executionWilaya: "",
    executionDelayDays: "",
    submissionBondRequired: true,
    submissionBondAmount: "",
    dceDeadline: "",
    offerDeadline: tender.deadline,
    openingDate: "",
    cdc: {
      title: "",
      version: "v1.0.0",
      withdrawalPrice: "0.00",
      isPublished: false,
    },
    lots: [],
    eligibilityCriteria: [],
    evaluationCriteria: [],
  };
}

export async function listServiceContractantTenders(): Promise<
  ServiceContractantTenderItem[]
> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantTenderItem[]>(
      "/service-contractant/tenders",
      {
        method: "GET",
      },
    );
  }

  await sleep(250);
  return [...mockedTenders];
}

export async function saveServiceContractantTenderDraft(
  payload: SaveTenderDraftPayload,
): Promise<TenderMutationResult> {
  if (API_BASE_URL) {
    return requestJson<TenderMutationResult>(
      "/service-contractant/tenders/drafts",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(300);
  const draftId = payload.id || `AO-${Date.now()}`;
  draftStore.set(draftId, payload);

  const existingIndex = mockedTenders.findIndex((item) => item.id === draftId);
  const nextItem: ServiceContractantTenderItem = {
    id: draftId,
    reference: payload.reference,
    object: payload.object || "Sans objet",
    type: mapProcedureType(payload.procedureType),
    deadline: buildDeadline(payload),
    status: "brouillon",
  };

  if (existingIndex === -1) {
    mockedTenders.unshift(nextItem);
  } else {
    mockedTenders[existingIndex] = nextItem;
  }

  return {
    id: draftId,
    reference: payload.reference,
    status: "brouillon",
  };
}

export async function getServiceContractantTenderDraftById(
  id: string,
): Promise<ServiceContractantTenderDraft | null> {
  if (API_BASE_URL) {
    try {
      return await requestJson<ServiceContractantTenderDraft>(
        `/service-contractant/tenders/drafts/${id}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(180);

  const draft = draftStore.get(id);
  if (draft) {
    return { id, ...draft };
  }

  const tender = mockedTenders.find((item) => item.id === id);
  if (!tender || tender.status !== "brouillon") {
    return null;
  }

  return buildDefaultDraftFromTender(tender);
}

export async function publishServiceContractantTender(
  payload: PublishTenderPayload,
): Promise<TenderMutationResult> {
  if (API_BASE_URL) {
    return requestJson<TenderMutationResult>(
      "/service-contractant/tenders/publish",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(400);
  const id = payload.id || `AO-${Date.now()}`;
  const avisReference = `AVIS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

  const existingIndex = mockedTenders.findIndex((item) => item.id === id);
  const nextItem: ServiceContractantTenderItem = {
    id,
    reference: payload.draft.reference,
    object: payload.draft.object || "Sans objet",
    type: mapProcedureType(payload.draft.procedureType),
    deadline: buildDeadline(payload.draft),
    status: "publie",
  };

  if (existingIndex === -1) {
    mockedTenders.unshift(nextItem);
  } else {
    mockedTenders[existingIndex] = nextItem;
  }

  draftStore.delete(id);

  return {
    id,
    reference: payload.draft.reference,
    status: "publie",
    avisReference,
  };
}

export async function toggleServiceContractantTenderStatus(
  id: string,
): Promise<ServiceContractantTenderStatus> {
  if (API_BASE_URL) {
    const result = await requestJson<{
      status: ServiceContractantTenderStatus;
    }>(`/service-contractant/tenders/${id}/status/toggle`, {
      method: "PATCH",
    });

    return result.status;
  }

  await sleep(180);
  const item = mockedTenders.find((row) => row.id === id);
  if (!item) {
    throw new Error("AO introuvable");
  }

  if (item.status === "publie") {
    item.status = "en_cours";
  } else if (item.status === "en_cours") {
    item.status = "publie";
  }

  return item.status;
}
