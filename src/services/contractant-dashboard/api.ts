import { apiClient } from "@/services/client";

export interface ContractantDashboardStats {
  activeAos: number;
  pendingAttributions: number;
  openRecours: number;
  ongoingMarches: number;
}

export interface ContractantActivityItem {
  id: string;
  type: "STATUS" | "SOUMISSION" | "RECOURS";
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface ContractantAlertItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium";
}

export interface ContractantDeadlineItem {
  id: string;
  title: string;
  dueAt: string;
}

export interface ContractantDashboardData {
  userName: string;
  organizationName: string;
  stats: ContractantDashboardStats;
  activities: ContractantActivityItem[];
  alerts: ContractantAlertItem[];
  deadlines: ContractantDeadlineItem[];
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface PaginatedPayload<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
  statut?: string;
  dateLimiteSoumission?: string;
  serviceContractantId?: string;
  service_contractant_id?: string;
}

interface AttributionRecord {
  id: string;
  type?: string;
  aoId?: string;
  ao_id?: string;
  appelOffres?: {
    id?: string;
  };
}

interface MarcheRecord {
  id: string;
  aoId?: string;
  ao_id?: string;
  appelOffres?: {
    id?: string;
  };
}

interface RecoursRecord {
  id: string;
  statut?: string;
}

interface MePayload {
  user?: {
    userId?: string;
    email?: string;
  };
}

interface UserProfile {
  nom?: string;
  prenom?: string;
}

interface ServiceContractantRecord {
  id: string;
  userId?: string;
  user_id?: string;
  organisation?: {
    denomination?: string;
  };
}

interface IdentityData {
  userName: string;
  organizationName: string;
  userId: string | null;
  serviceContractantId: string | null;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (
      "success" in (payload as Record<string, unknown>) ||
      "statusCode" in (payload as Record<string, unknown>)
    )
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as PaginatedPayload<T>).data)
  ) {
    return (unwrapped as PaginatedPayload<T>).data;
  }

  return [];
}

function parseDate(input?: string): Date | null {
  if (!input) {
    return null;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalizeId(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase();
}

function getAoOwnerId(ao: AppelOffreRecord): string | null {
  return normalizeId(ao.serviceContractantId ?? ao.service_contractant_id ?? null);
}

function belongsToAuthenticatedContractant(
  ao: AppelOffreRecord,
  identity: IdentityData,
): boolean {
  const ownerId = getAoOwnerId(ao);
  if (!ownerId) {
    return false;
  }

  const serviceContractantId = normalizeId(identity.serviceContractantId);
  if (serviceContractantId && ownerId === serviceContractantId) {
    return true;
  }

  const userId = normalizeId(identity.userId);
  if (userId && ownerId === userId) {
    return true;
  }

  return false;
}

function getLinkedAoId(item: AttributionRecord | MarcheRecord): string | null {
  return normalizeId(item.aoId ?? item.ao_id ?? item.appelOffres?.id ?? null);
}

function toRelativeDeadline(date: Date): string {
  const now = new Date();
  const ms = date.getTime() - now.getTime();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));

  if (days <= 0) {
    return "Aujourd'hui";
  }

  if (days === 1) {
    return "Demain";
  }

  return `Dans ${days} jours`;
}

function buildMockedActivities(aos: AppelOffreRecord[]): ContractantActivityItem[] {
  const sample = aos.slice(0, 3);

  return [
    {
      id: "mock-log-1",
      type: "STATUS",
      title: "Mise a jour de statut AO",
      subtitle: sample[0]?.reference
        ? `Le statut de ${sample[0].reference} a ete actualise.`
        : "Un appel d'offres a recu une mise a jour de statut.",
      timestamp: "Il y a 5 min",
    },
    {
      id: "mock-log-2",
      type: "SOUMISSION",
      title: "Evenement de soumission",
      subtitle:
        "Flux d'activite soumissions conserve en mode mock tant que le service audit n'est pas disponible.",
      timestamp: "Il y a 18 min",
    },
    {
      id: "mock-log-3",
      type: "RECOURS",
      title: "Evenement recours",
      subtitle:
        "Journal d'activite recours maintenu en mode mock (integration audit en attente).",
      timestamp: "Il y a 42 min",
    },
  ];
}

async function listOpenRecoursForAos(aos: AppelOffreRecord[]): Promise<number> {
  if (aos.length === 0) {
    return 0;
  }

  const results = await Promise.allSettled(
    aos.map((ao) => apiClient<unknown>(`/api/v1/recours/appel-offre/${ao.id}`, { method: "GET" })),
  );

  let count = 0;

  for (const result of results) {
    if (result.status !== "fulfilled") {
      continue;
    }

    const recours = extractList<RecoursRecord>(result.value);
    count += recours.filter((item) => {
      const status = (item.statut || "").toUpperCase();
      return status === "DEPOSE" || status === "EN_EXAMEN";
    }).length;
  }

  return count;
}

async function getIdentityData(): Promise<IdentityData> {
  let userName = "Utilisateur contractant";
  let organizationName = "Organisation non renseignee";
  let userId: string | null = null;
  let serviceContractantId: string | null = null;

  try {
    const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" });
    const me = unwrapEnvelope<MePayload>(meRaw);
    userId = me?.user?.userId || null;
    const email = me?.user?.email;

    if (email) {
      userName = email;
    }

    if (!userId) {
      return { userName, organizationName, userId, serviceContractantId };
    }

    const [profileRaw, scRaw] = await Promise.all([
      apiClient<unknown>(`/api/v1/users/profiles/user/${userId}`, { method: "GET" }).catch(() => null),
      apiClient<unknown>("/api/v1/users/services-contractants?page=1&limit=100", { method: "GET" }).catch(() => null),
    ]);

    if (profileRaw) {
      const profile = unwrapEnvelope<UserProfile>(profileRaw);
      const fullName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim();
      if (fullName) {
        userName = fullName;
      }
    }

    if (scRaw) {
      const list = extractList<ServiceContractantRecord>(scRaw);
      const normalizedUserId = normalizeId(userId);
      const current = list.find((item) => {
        const linkedUserId = normalizeId(item.userId ?? item.user_id ?? null);
        return normalizedUserId !== null && linkedUserId === normalizedUserId;
      });

      if (current?.id) {
        serviceContractantId = current.id;
      }

      const denomination = current?.organisation?.denomination;
      if (denomination) {
        organizationName = denomination;
      }
    }
  } catch {
    // Keep resilient fallback labels when identity endpoints are temporarily unavailable.
  }

  return { userName, organizationName, userId, serviceContractantId };
}

/**
 * Contractant dashboard aggregation from live backend services.
 * Only activity logs remain mocked until audit service integration is available.
 */
export async function getContractantDashboardData(): Promise<ContractantDashboardData> {
  const [aosRaw, attributionsRaw, marchesRaw, identity] = await Promise.all([
    apiClient<unknown>("/api/v1/appels-offres?page=1&limit=200", { method: "GET" }),
    apiClient<unknown>("/api/v1/appels-offres/attributions", { method: "GET" }).catch(() => []),
    apiClient<unknown>("/api/v1/appels-offres/marches", { method: "GET" }).catch(() => []),
    getIdentityData(),
  ]);

  const aos = extractList<AppelOffreRecord>(aosRaw);
  const attributions = extractList<AttributionRecord>(attributionsRaw);
  const marches = extractList<MarcheRecord>(marchesRaw);

  const contractantAos = aos.filter((ao) => belongsToAuthenticatedContractant(ao, identity));
  const contractantAoIdSet = new Set(
    contractantAos.map((ao) => normalizeId(ao.id)).filter((id): id is string => Boolean(id)),
  );

  const contractantAttributions = attributions.filter((item) => {
    const aoId = getLinkedAoId(item);
    return aoId !== null && contractantAoIdSet.has(aoId);
  });

  const contractantMarches = marches.filter((item) => {
    const aoId = getLinkedAoId(item);
    return aoId !== null && contractantAoIdSet.has(aoId);
  });

  const activeAos = contractantAos.filter((ao) => {
    const status = (ao.statut || "").toUpperCase();
    return (
      status === "PUBLIE" ||
      status === "EN_COURS" ||
      status === "OUVERTURE_PLIS" ||
      status === "EVALUATION"
    );
  }).length;

  const pendingAttributions = contractantAttributions.filter(
    (item) => (item.type || "").toUpperCase() === "PROVISOIRE",
  ).length;

  const openRecours = await listOpenRecoursForAos(contractantAos);
  const ongoingMarches = contractantMarches.length;

  const upcomingDeadlines = contractantAos
    .map((ao) => {
      const date = parseDate(ao.dateLimiteSoumission);
      if (!date) {
        return null;
      }

      return {
        id: `deadline-${ao.id}`,
        title: ao.reference
          ? `Fin de depot des plis - ${ao.reference}`
          : "Fin de depot des plis",
        at: date,
      };
    })
    .filter((item): item is { id: string; title: string; at: Date } => item !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      dueAt: toRelativeDeadline(item.at),
    }));

  const alerts: ContractantAlertItem[] = [];
  if (openRecours > 0) {
    alerts.push({
      id: "alert-open-recours",
      title: `${openRecours} recours ouvert(s)`,
      description:
        "Des recours en attente d'examen sont rattaches a vos appels d'offres.",
      severity: "high",
    });
  }
  if (pendingAttributions > 0) {
    alerts.push({
      id: "alert-pending-attribution",
      title: `${pendingAttributions} attribution(s) provisoire(s)`,
      description:
        "Des attributions provisoires necessitent un suivi (delais de recours / confirmation).",
      severity: "medium",
    });
  }

  return {
    userName: identity.userName,
    organizationName: identity.organizationName,
    stats: {
      activeAos,
      pendingAttributions,
      openRecours,
      ongoingMarches,
    },
    activities: buildMockedActivities(contractantAos),
    alerts,
    deadlines: upcomingDeadlines,
  };
}

/**
 * Fetch activity feed from the audit service.
 * Falls back to mocked activities if the audit service is unavailable.
 */
export async function getContractantActivityFeed(): Promise<ContractantActivityItem[]> {
  try {
    const raw = await apiClient<unknown>("/api/v1/audit/activities?limit=10", { method: "GET" });

    if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
      const items = (raw as { data: unknown }).data;
      if (Array.isArray(items)) {
        return items.map((item: { id?: string; type?: string; title?: string; subtitle?: string; timestamp?: string }) => ({
          id: item.id || crypto.randomUUID(),
          type: (item.type || "STATUS") as ContractantActivityItem["type"],
          title: item.title || "Activite",
          subtitle: item.subtitle || "",
          timestamp: item.timestamp || new Date().toISOString(),
        }));
      }
    }

    return [];
  } catch {
    // Fallback to empty - the dashboard already shows mocked activities from getContractantDashboardData
    return [];
  }
}
