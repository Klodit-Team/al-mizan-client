export interface AdministratorDashboardStats {
  utilisateursActifs: number;
  aoEnCours: number;
  recoursOuverts: number;
  incidentsIA: number;
}

export type AdministratorActivityType = "update" | "submission" | "recours" | "pv" | "marche";

export interface AdministratorActivityItem {
  id: string;
  type: AdministratorActivityType;
  title: string;
  description: string;
  time: string;
}

export interface AdministratorAiAlert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface AdministratorDeadlineItem {
  id: string;
  type: "depot" | "commission" | "expiration";
  title: string;
  subtitle: string;
  time: string;
}

export interface AdministratorSupportLink {
  id: string;
  label: string;
  href: string;
  type: "guide" | "support";
}

export interface AdministratorDashboardData {
  userName: string;
  roleLabel: string;
  stats: AdministratorDashboardStats;
  activities: AdministratorActivityItem[];
  aiAlerts: AdministratorAiAlert[];
  deadlines: AdministratorDeadlineItem[];
  supportLinks: AdministratorSupportLink[];
}



import { apiClient } from "@/services/client";

// ─── Raw service payloads ────────────────────────────────────────────────────

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

interface PaginatedEnvelope<T> {
  data?: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

interface RawDashboardActivity {
  id?: string;
  type?: string;
  title?: string;
  subtitle?: string;
  timestamp?: string;
}

interface RawAppelOffre {
  id?: string;
  reference?: string;
  objet?: string;
  statut?: string;
  dateLimiteSoumission?: string;
  date_limite_soumission?: string;
  datePublication?: string;
  date_publication?: string;
}

interface RawRecours {
  id?: string;
  reference?: string;
  statut?: string;
  motif?: string;
  dateLimiteReponse?: string;
  date_limite_reponse?: string;
  appelOffreId?: string;
  appel_offre_id?: string;
  appelOffre?: {
    reference?: string;
    objet?: string;
  };
  appel_offre?: {
    reference?: string;
    objet?: string;
  };
}

interface RawCommissionMarche {
  id?: string;
  reference?: string;
  intitule?: string;
  statut?: string;
  dateOuvertureOffres?: string;
  date_ouverture_offres?: string;
  dateDeliberations?: string;
  date_deliberations?: string;
}

interface RawCommissionEvaluation {
  id?: string;
  reference?: string;
  intitule?: string;
  statut?: string;
  dateReunion?: string;
  date_reunion?: string;
}

interface RawIncident {
  id?: string;
  type_incident?: string;
  entite_source?: string;
  entite_id?: string;
  modele_ia?: string;
  decision_ia?: string | null;
  decision_humaine?: string | null;
  ecart_score?: number | string | null;
  confiance_ia?: number | string | null;
  gravite?: string;
  statut?: string;
  date_detection?: string;
  created_at?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (isObject(payload) && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

function unwrapArray<T>(payload: unknown): T[] {
  const unwrapped = unwrapData<unknown>(payload as T[] | ApiEnvelope<T[]>);
  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (isObject(unwrapped) && Array.isArray((unwrapped as PaginatedEnvelope<T>).data)) {
    return (unwrapped as PaginatedEnvelope<T>).data as T[];
  }

  return [];
}

function extractTotal(payload: unknown): number {
  if (isObject(payload) && "meta" in payload) {
    const meta = payload.meta as { total?: unknown } | undefined;
    if (typeof meta?.total === "number") {
      return meta.total;
    }
  }

  const data = unwrapArray<unknown>(payload);
  return data.length;
}

function toDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatAbsoluteDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeDate(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));

  if (Math.abs(diffDays) <= 0) {
    if (Math.abs(diffHours) <= 1) {
      return diffMs >= 0 ? "Dans 1 heure" : "Il y a 1 heure";
    }

    return diffMs >= 0 ? `Dans ${Math.max(diffHours, 1)} heures` : `Il y a ${Math.abs(diffHours)} heures`;
  }

  if (diffDays === 1) {
    return "Demain";
  }

  if (diffDays === -1) {
    return "Hier";
  }

  if (diffDays > 1) {
    return `Dans ${diffDays} jours`;
  }

  return `Il y a ${Math.abs(diffDays)} jours`;
}

function formatDashboardType(type?: string): AdministratorActivityType {
  const raw = (type ?? "").toUpperCase();
  if (raw === "SOUMISSION") return "submission";
  if (raw === "RECOURS") return "recours";
  if (raw === "RESULTAT" || raw === "MARCHE") return "marche";
  return "update";
}

function parseScore(value?: number | string | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapActivity(raw: RawDashboardActivity, idx: number): AdministratorActivityItem {
  const timestamp = raw.timestamp ? new Date(raw.timestamp) : null;

  return {
    id: raw.id ?? `activity-${idx}`,
    type: formatDashboardType(raw.type),
    title: raw.title ?? "Activité",
    description: raw.subtitle ?? "",
    time: timestamp ? formatRelativeDate(timestamp) : "",
  };
}

function mapIncidentToAlert(inc: RawIncident, idx: number): AdministratorAiAlert {
  const severityMap: Record<string, "high" | "medium" | "low"> = {
    CRITIQUE: "high",
    ELEVEE: "high",
    MOYENNE: "medium",
    FAIBLE: "low",
  };

  const score = parseScore(inc.ecart_score);

  return {
    id: inc.id ?? `incident-${idx}`,
    severity: severityMap[(inc.gravite ?? "").toUpperCase()] ?? "medium",
    title: (inc.type_incident ?? "Incident IA").replace(/_/g, " "),
    description: [
      inc.entite_source ? `Source: ${inc.entite_source}` : null,
      inc.decision_ia ? `IA: ${inc.decision_ia}` : null,
      inc.decision_humaine ? `Humain: ${inc.decision_humaine}` : null,
      score !== null ? `Écart: ${(score * 100).toFixed(0)}%` : null,
    ].filter(Boolean).join(" · "),
    actionLabel: "Voir l'incident",
    actionHref: "/dashboard/admin/incidents",
  };
}

function mapAppelOffreDeadline(ao: RawAppelOffre): (AdministratorDeadlineItem & { sortAt: number }) | null {
  const date = toDate(ao.dateLimiteSoumission ?? ao.date_limite_soumission ?? null);
  if (!date) {
    return null;
  }

  const label = ao.reference ?? ao.objet ?? "Appel d'offres";
  return {
    id: `ao-${ao.id ?? label}`,
    type: "depot",
    title: `Fin de dépôt - ${label}`,
    subtitle: `${formatAbsoluteDate(date)}`,
    time: formatRelativeDate(date),
    sortAt: date.getTime(),
  };
}

function mapRecoursDeadline(recours: RawRecours): (AdministratorDeadlineItem & { sortAt: number }) | null {
  const date = toDate(recours.dateLimiteReponse ?? recours.date_limite_reponse ?? null);
  if (!date) {
    return null;
  }

  const label = recours.reference ?? recours.appelOffre?.reference ?? recours.appel_offre?.reference ?? "Recours";
  return {
    id: `recours-${recours.id ?? label}`,
    type: "expiration",
    title: `Expiration délai recours - ${label}`,
    subtitle: `${formatAbsoluteDate(date)}`,
    time: formatRelativeDate(date),
    sortAt: date.getTime(),
  };
}

function mapCommissionDeadline(
  commission: RawCommissionMarche | RawCommissionEvaluation,
): (AdministratorDeadlineItem & { sortAt: number }) | null {
  const candidateDates = [
    "dateOuvertureOffres" in commission
      ? toDate(commission.dateOuvertureOffres ?? commission.date_ouverture_offres ?? null)
      : null,
    "dateDeliberations" in commission
      ? toDate(commission.dateDeliberations ?? commission.date_deliberations ?? null)
      : null,
    "dateReunion" in commission
      ? toDate(commission.dateReunion ?? commission.date_reunion ?? null)
      : null,
  ].filter((date): date is Date => Boolean(date));

  const futureDate = candidateDates
    .filter((date) => date.getTime() >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.getTime() - b.getTime())[0] ?? candidateDates.sort((a, b) => a.getTime() - b.getTime())[0];

  if (!futureDate) {
    return null;
  }

  const label = commission.reference ?? commission.intitule ?? "Commission";
  return {
    id: `commission-${commission.id ?? label}`,
    type: "commission",
    title: `Réunion commission - ${label}`,
    subtitle: `${formatAbsoluteDate(futureDate)}`,
    time: formatRelativeDate(futureDate),
    sortAt: futureDate.getTime(),
  };
}

async function fetchTotal(path: string): Promise<number> {
  const payload = await apiClient<unknown>(path, { method: "GET" });
  return extractTotal(payload);
}

async function fetchList<T>(path: string): Promise<T[]> {
  const payload = await apiClient<unknown>(path, { method: "GET" });
  return unwrapArray<T>(payload);
}

// ─── Public API functions ─────────────────────────────────────────────────────

export async function getAdministratorDashboardData(): Promise<AdministratorDashboardData> {
  const [stats, activities, aiAlerts, deadlines, supportLinks] = await Promise.all([
    getAdministratorDashboardStats(),
    getAdministratorDashboardActivities(),
    getAdministratorDashboardAiAlerts(),
    getAdministratorDashboardDeadlines(),
    getAdministratorDashboardSupportLinks(),
  ]);

  return {
    userName: "Ahmed Mansour",
    roleLabel: "Administrateur plateforme",
    stats,
    activities,
    aiAlerts,
    deadlines,
    supportLinks,
  };
}

export async function getAdministratorDashboardStats(): Promise<AdministratorDashboardStats> {
  const activeTenderStatuses = ["PUBLIE", "EN_COURS", "OUVERTURE_PLIS", "EVALUATION"];
  const [operateursTotal, servicesTotal, aoCounts, recoursStats, incidentsElevated, incidentsCritical] = await Promise.all([
    fetchTotal("/api/v1/operateurs-economiques?limit=1&page=1"),
    fetchTotal("/api/v1/services-contractants?limit=1&page=1"),
    Promise.all(activeTenderStatuses.map((statut) => fetchTotal(`/api/v1/appels-offres?statut=${statut}&limit=1&page=1`))),
    apiClient<Record<string, number> | ApiEnvelope<Record<string, number>>>("/api/v1/recours/statistiques", { method: "GET" }),
    fetchTotal("/api/v1/incidents?gravite=ELEVEE&statut=OUVERT&limit=1&page=1"),
    fetchTotal("/api/v1/incidents?gravite=CRITIQUE&statut=OUVERT&limit=1&page=1"),
  ]);

  const recoursData = unwrapData<Record<string, number>>(recoursStats);
  const recoursOuverts = (recoursData?.DEPOSE ?? 0) + (recoursData?.EN_EXAMEN ?? 0);

  return {
    utilisateursActifs: operateursTotal + servicesTotal,
    aoEnCours: aoCounts.reduce((sum, count) => sum + count, 0),
    recoursOuverts,
    incidentsIA: incidentsElevated + incidentsCritical,
  };
}

/**
 * GET /api/v1/audit/activities
 */
export async function getAdministratorDashboardActivities(): Promise<AdministratorActivityItem[]> {
  try {
    const raw = await apiClient<RawDashboardActivity[] | ApiEnvelope<RawDashboardActivity[]>>(
      `/api/v1/audit/activities?limit=10`,
      { method: "GET" }
    );
    const activities = unwrapData(raw);
    if (Array.isArray(activities) && activities.length > 0) {
      return activities.map(mapActivity);
    }
  } catch {
    // API failed, return empty
  }
  return [];
}

/**
 * GET /api/v1/incidents — fetch open ELEVEE/CRITIQUE incidents for the AI-alerts widget.
 */
export async function getAdministratorDashboardAiAlerts(): Promise<AdministratorAiAlert[]> {
  try {
    const [elevee, critique] = await Promise.all([
      apiClient<RawIncident[] | ApiEnvelope<RawIncident[]>>(`/api/v1/incidents?gravite=ELEVEE&statut=OUVERT&limit=5`, { method: "GET" }),
      apiClient<RawIncident[] | ApiEnvelope<RawIncident[]>>(`/api/v1/incidents?gravite=CRITIQUE&statut=OUVERT&limit=5`, { method: "GET" }),
    ]);
    const eleveeData = unwrapData(elevee);
    const critiqueData = unwrapData(critique);
    const combined = [
      ...(Array.isArray(critiqueData) ? critiqueData : []),
      ...(Array.isArray(eleveeData)   ? eleveeData   : []),
    ].slice(0, 5);
    if (combined.length > 0) {
      return combined.map(mapIncidentToAlert);
    }
  } catch {
    // API failed, return empty
  }
  return [];
}

export async function getAdministratorDashboardDeadlines(): Promise<AdministratorDeadlineItem[]> {
  try {
    const [tenders, recoursDeposes, recoursEnExamen, commissionsMarche, commissionsEvaluation] = await Promise.all([
      Promise.all([
        fetchList<RawAppelOffre>("/api/v1/appels-offres?statut=PUBLIE&limit=100&page=1"),
        fetchList<RawAppelOffre>("/api/v1/appels-offres?statut=EN_COURS&limit=100&page=1"),
        fetchList<RawAppelOffre>("/api/v1/appels-offres?statut=OUVERTURE_PLIS&limit=100&page=1"),
        fetchList<RawAppelOffre>("/api/v1/appels-offres?statut=EVALUATION&limit=100&page=1"),
      ]).then((chunks) => chunks.flat()),
      fetchList<RawRecours>("/api/v1/recours?statut=DEPOSE&limit=100&page=1"),
      fetchList<RawRecours>("/api/v1/recours?statut=EN_EXAMEN&limit=100&page=1"),
      fetchList<RawCommissionMarche>("/api/v1/commissions-marche?limit=100&page=1"),
      fetchList<RawCommissionEvaluation>("/api/v1/commissions-evaluation?limit=100&page=1"),
    ]);

    const candidates = [
      ...tenders
        .map(mapAppelOffreDeadline)
        .filter((item): item is AdministratorDeadlineItem & { sortAt: number } => Boolean(item)),
      ...recoursDeposes
        .map(mapRecoursDeadline)
        .filter((item): item is AdministratorDeadlineItem & { sortAt: number } => Boolean(item)),
      ...recoursEnExamen
        .map(mapRecoursDeadline)
        .filter((item): item is AdministratorDeadlineItem & { sortAt: number } => Boolean(item)),
      ...commissionsMarche
        .map(mapCommissionDeadline)
        .filter((item): item is AdministratorDeadlineItem & { sortAt: number } => Boolean(item))
        .map(({ sortAt, ...item }) => ({ ...item, sortAt })),
      ...commissionsEvaluation
        .map(mapCommissionDeadline)
        .filter((item): item is AdministratorDeadlineItem & { sortAt: number } => Boolean(item))
        .map(({ sortAt, ...item }) => ({ ...item, sortAt })),
    ]
      .filter((item) => item.time !== "")
      .sort((a, b) => a.sortAt - b.sortAt)
      .slice(0, 3);

    if (candidates.length > 0) {
      return candidates.map(({ sortAt: _sortAt, ...item }) => item);
    }
  } catch {
    // API failed, return fallback below
  }

  return [];
}

export async function getAdministratorDashboardSupportLinks(): Promise<AdministratorSupportLink[]> {
  return [
    {
      id: "admin-audit-guide",
      label: "Journal d'audit",
      href: "/dashboard/admin/journal-audit",
      type: "guide",
    },
    {
      id: "admin-incidents-support",
      label: "Incidents IA",
      href: "/dashboard/admin/incidents",
      type: "support",
    },
    {
      id: "admin-organisations-guide",
      label: "Organisations",
      href: "/dashboard/admin/organisations",
      type: "guide",
    },
  ];
}
