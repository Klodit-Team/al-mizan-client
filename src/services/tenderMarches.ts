export type TenderMarcheStatus = "en_cours" | "termine" | "resilie";
export type TenderMarcheNextStatus = "termine" | "resilie";

export interface ServiceContractantMarcheListItem {
  id: string;
  reference: string;
  object: string;
  economicOperatorName: string;
  globalAmount: string;
  signatureDate: string;
  expectedEndDate: string;
  status: TenderMarcheStatus;
}

export interface ServiceContractantMarcheDetail extends ServiceContractantMarcheListItem {
  originTenderId: string;
  aoReference: string;
  executionDelayDays: number;
  economicOperatorContactName: string;
  economicOperatorContactEmail: string;
  economicOperatorContactPhone: string;
  description: string;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const marcheStore = new Map<string, ServiceContractantMarcheDetail>();

const DEFAULT_MARCHES: ServiceContractantMarcheDetail[] = [
  {
    id: "MAR-2026-001",
    reference: "M-2026-001",
    object: "Acquisition d'equipements reseau securises",
    economicOperatorName: "Global Network SA",
    globalAmount: "18200000",
    signatureDate: "2026-02-10",
    expectedEndDate: "2026-08-10",
    executionDelayDays: 182,
    status: "en_cours",
    originTenderId: "AO-2023-001",
    aoReference: "AO-2026-041",
    economicOperatorContactName: "Mourad Benali",
    economicOperatorContactEmail: "m.benali@globalnetwork.dz",
    economicOperatorContactPhone: "+213 555 11 22 33",
    description:
      "Marche lance pour le renouvellement de l'infrastructure reseau securisee de l'organisme.",
  },
  {
    id: "MAR-2026-002",
    reference: "M-2026-002",
    object: "Maintenance des groupes electrogenes",
    economicOperatorName: "EURL PowerTech",
    globalAmount: "9750000",
    signatureDate: "2026-01-18",
    expectedEndDate: "2026-06-18",
    executionDelayDays: 150,
    status: "en_cours",
    originTenderId: "AO-2023-002",
    aoReference: "AO-2025-119",
    economicOperatorContactName: "Sofiane Kadri",
    economicOperatorContactEmail: "contact@powertech.dz",
    economicOperatorContactPhone: "+213 661 72 10 90",
    description:
      "Marche de maintenance preventive et corrective des groupes electrogenes du site principal.",
  },
  {
    id: "MAR-2026-003",
    reference: "M-2026-003",
    object: "Fourniture de postes de travail bureautiques",
    economicOperatorName: "Informatique Plus SPA",
    globalAmount: "12800000",
    signatureDate: "2025-11-03",
    expectedEndDate: "2026-03-30",
    executionDelayDays: 147,
    status: "termine",
    originTenderId: "AO-2023-003",
    aoReference: "AO-2025-084",
    economicOperatorContactName: "Leila Mansouri",
    economicOperatorContactEmail: "l.mansouri@informatiqueplus.dz",
    economicOperatorContactPhone: "+213 770 03 40 21",
    description:
      "Marche execute pour la fourniture et installation de postes de travail complets.",
  },
  {
    id: "MAR-2026-004",
    reference: "M-2026-004",
    object: "Travaux de rehabilitation de locaux techniques",
    economicOperatorName: "Batimaghreb SARL",
    globalAmount: "26400000",
    signatureDate: "2025-09-25",
    expectedEndDate: "2026-02-15",
    executionDelayDays: 143,
    status: "resilie",
    originTenderId: "AO-2023-004",
    aoReference: "AO-2025-061",
    economicOperatorContactName: "Nadia Rezig",
    economicOperatorContactEmail: "direction@batimaghreb.dz",
    economicOperatorContactPhone: "+213 551 44 89 10",
    description:
      "Marche resilie suite a des retards majeurs d'execution non regularises.",
  },
  {
    id: "MAR-2026-005",
    reference: "M-2026-005",
    object: "Prestations de cybersurveillance SOC",
    economicOperatorName: "CyberShield Consulting",
    globalAmount: "14350000",
    signatureDate: "2026-03-02",
    expectedEndDate: "2027-03-01",
    executionDelayDays: 364,
    status: "en_cours",
    originTenderId: "AO-2023-005",
    aoReference: "AO-2026-017",
    economicOperatorContactName: "Yacine Ould Kaci",
    economicOperatorContactEmail: "ops@cybershield.dz",
    economicOperatorContactPhone: "+213 560 90 31 40",
    description:
      "Accompagnement SOC 24/7, supervision des alertes et production de rapports mensuels.",
  },
  {
    id: "MAR-2026-006",
    reference: "M-2026-006",
    object: "Acquisition de mobilier administratif",
    economicOperatorName: "Mobidis Algeria",
    globalAmount: "5120000",
    signatureDate: "2025-10-14",
    expectedEndDate: "2026-01-14",
    executionDelayDays: 92,
    status: "termine",
    originTenderId: "AO-2023-006",
    aoReference: "AO-2025-073",
    economicOperatorContactName: "Sara Boulkroune",
    economicOperatorContactEmail: "s.boulkroune@mobidis.dz",
    economicOperatorContactPhone: "+213 557 60 02 87",
    description:
      "Marche cloture apres livraison integrale et reception definitive du mobilier.",
  },
];

function cloneMarche(
  item: ServiceContractantMarcheDetail,
): ServiceContractantMarcheDetail {
  return { ...item };
}

function ensureMarcheStore(): Map<string, ServiceContractantMarcheDetail> {
  if (marcheStore.size === 0) {
    DEFAULT_MARCHES.forEach((item) => {
      marcheStore.set(item.id, cloneMarche(item));
    });
  }

  return marcheStore;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  const response = await fetch(url, {
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

  const json = await response.json();

  // Unwrap paginated responses { data: [...] }
  if (json && typeof json === "object" && "data" in json && Array.isArray(json.data)) {
    return json.data as T;
  }

  return json as T;
}

export async function listServiceContractantMarches(): Promise<
  ServiceContractantMarcheListItem[]
> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantMarcheListItem[]>(
      "/api/v1/appels-offres/marches",
      {
        method: "GET",
      },
    );
  }

  await sleep(160);
  return Array.from(ensureMarcheStore().values()).map((item) => ({
    id: item.id,
    reference: item.reference,
    object: item.object,
    economicOperatorName: item.economicOperatorName,
    globalAmount: item.globalAmount,
    signatureDate: item.signatureDate,
    expectedEndDate: item.expectedEndDate,
    status: item.status,
  }));
}

export async function getServiceContractantMarcheById(
  id: string,
): Promise<ServiceContractantMarcheDetail | null> {
  if (USE_REAL_API) {
    try {
      return await requestJson<ServiceContractantMarcheDetail>(
        `/api/v1/appels-offres/marches/${id}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(120);
  const found = ensureMarcheStore().get(id);
  return found ? cloneMarche(found) : null;
}

export async function updateServiceContractantMarcheStatus(
  id: string,
  status: TenderMarcheNextStatus,
): Promise<ServiceContractantMarcheDetail> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantMarcheDetail>(
      `/api/v1/appels-offres/marches/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
  }

  await sleep(140);
  const store = ensureMarcheStore();
  const current = store.get(id);

  if (!current) {
    throw new Error("Marche introuvable.");
  }

  if (current.status !== "en_cours") {
    throw new Error("Seul un marche en cours peut etre mis a jour.");
  }

  const updated: ServiceContractantMarcheDetail = {
    ...current,
    status,
  };

  store.set(id, updated);
  return cloneMarche(updated);
}
