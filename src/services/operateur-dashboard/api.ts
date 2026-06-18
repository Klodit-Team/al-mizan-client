import { apiClient } from "@/services/client";

export type OeSubmissionStatus =
  | "brouillon"
  | "deposee"
  | "recue"
  | "evaluee"
  | "retenue"
  | "rejetee";

export type OeRecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

export interface OeDashboardStats {
  aoActifs: number;
  soumissionsEnCours: number;
  marchesRemportes: number;
  recoursOuverts: number;
}

export interface OeActivityItem {
  id: string;
  type: "SOUMISSION" | "NOTIFICATION" | "RECOURS" | "RESULTAT";
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface OeDeadlineItem {
  id: string;
  title: string;
  dueAt: string;
  urgency: "high" | "medium" | "low";
}

export interface OeSubmissionItem {
  id: string;
  aoReference: string;
  aoObject: string;
  submittedAt: string;
  status: OeSubmissionStatus;
}

export interface OeRecoursItem {
  id: string;
  aoReference: string;
  aoObject: string;
  depositedAt: string;
  status: OeRecoursStatus;
  motif: string;
}

export interface OeDashboardData {
  userName: string;
  companyName: string;
  stats: OeDashboardStats;
  activities: OeActivityItem[];
  deadlines: OeDeadlineItem[];
  recentSubmissions: OeSubmissionItem[];
  openRecours: OeRecoursItem[];
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

interface MePayload {
  id?: string;
  email?: string;
  user?: {
    userId?: string;
    id?: string;
    email?: string;
  };
}

interface UserProfile {
  nom?: string;
  prenom?: string;
}

interface OperateurRecord {
  id: string;
  userId?: string;
  user_id?: string;
  organisationId?: string;
  organisation?: {
    denomination?: string;
  };
}

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
  statut?: string;
  dateLimiteSoumission?: string;
}

interface SubmissionRecord {
  id: string;
  appelOffreId?: string;
  appel_offre_id?: string;
  statut?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  submittedAt?: string;
  submitted_at?: string;
  dateSoumission?: string;
  date_soumission?: string;
  appelOffre?: {
    id?: string;
    reference?: string;
    objet?: string;
  };
  appel_offre?: {
    id?: string;
    reference?: string;
    objet?: string;
  };
  aoReference?: string;
  aoObject?: string;
}

interface RecoursRecord {
  id: string;
  appelOffreId?: string;
  appel_offre_id?: string;
  dateDepot?: string;
  date_depot?: string;
  statut?: string;
  motif?: string;
  appelOffre?: {
    id?: string;
    reference?: string;
    objet?: string;
  };
  appel_offre?: {
    id?: string;
    reference?: string;
    objet?: string;
  };
}

interface IdentityData {
  userId: string | null;
  userName: string;
  companyName: string;
  operateurId: string | null;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (!payload) return payload as T;
  if (typeof payload === "object") {
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

function normalizeId(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase();
}

function toRelativeDue(date: Date): { dueAt: string; urgency: "high" | "medium" | "low" } {
  const now = new Date();
  const ms = date.getTime() - now.getTime();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));

  if (days <= 1) {
    return { dueAt: days <= 0 ? "Aujourd'hui" : "Demain", urgency: "high" };
  }
  if (days <= 5) {
    return { dueAt: `Dans ${days} jours`, urgency: "medium" };
  }
  return { dueAt: `Dans ${days} jours`, urgency: "low" };
}

function normalizeSubmissionStatus(value: unknown): OeSubmissionStatus {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "BROUILLON" || raw === "DRAFT") return "brouillon";
  if (raw === "DEPOSEE" || raw === "SOUMISE" || raw === "SUBMITTED") return "deposee";
  if (raw === "RECUE" || raw === "RECU" || raw === "RECEIVED") return "recue";
  if (raw === "EVALUEE" || raw === "EN_EVALUATION" || raw === "EVALUATED") return "evaluee";
  if (raw === "RETENUE" || raw === "ATTRIBUEE" || raw === "SELECTED") return "retenue";

  return "rejetee";
}

function getSubmissionAoId(item: SubmissionRecord): string | null {
  return normalizeId(
    item.appelOffreId
      || item.appel_offre_id
      || item.appelOffre?.id
      || item.appel_offre?.id
      || null,
  );
}

function normalizeRecoursStatus(value: unknown): OeRecoursStatus {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "DEPOSE" || raw === "DEPOSEE") return "depose";
  if (raw === "EN_EXAMEN" || raw === "EXAMEN") return "en_examen";
  if (raw === "ACCEPTE" || raw === "ACCEPTEE") return "accepte";

  return "rejete";
}

function buildMockedActivities(submissionsCount: number): OeActivityItem[] {
  return [
    {
      id: "oe-log-1",
      type: "NOTIFICATION",
      title: "Nouveaux appels d'offres publies",
      subtitle: "Les opportunites recentes ont ete actualisees sur votre tableau de bord.",
      timestamp: "Il y a 10 min",
    },
    {
      id: "oe-log-2",
      type: "SOUMISSION",
      title: "Suivi des soumissions",
      subtitle: `${submissionsCount} soumission(s) recuperee(s) via l'API gateway.`,
      timestamp: "Il y a 35 min",
    },
    {
      id: "oe-log-3",
      type: "RESULTAT",
      title: "Etat des attributions",
      subtitle: "Le flux resultats reste mocke en attendant l'audit detaille.",
      timestamp: "Il y a 2 h",
    },
    {
      id: "oe-log-4",
      type: "RECOURS",
      title: "Suivi des recours",
      subtitle: "Les activites recours sont conservees en mode mock comme le dashboard contractant.",
      timestamp: "Hier",
    },
  ];
}

async function getIdentityData(): Promise<IdentityData> {
  let userName = "Utilisateur operateur";
  let companyName = "Organisation non renseignee";
  let userId: string | null = null;
  let operateurId: string | null = null;

  try {
    const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" });
    const me = unwrapEnvelope<MePayload>(meRaw);
    
    userId = me?.user?.userId || me?.user?.id || me?.id || null;
    const email = me?.user?.email || me?.email;

    if (email) userName = email;

    if (!userId) return { userId, userName, companyName, operateurId };

    const [profileRaw, oeRaw] = await Promise.all([
      apiClient<unknown>(`/api/v1/profiles/user/${userId}`, { method: "GET" }).catch(() => null),
      apiClient<unknown>("/api/v1/operateurs-economiques?page=1&limit=100", { method: "GET" }).catch(() => null),
    ]);

    if (profileRaw) {
      const profile = unwrapEnvelope<UserProfile>(profileRaw);
      const fullName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim();
      if (fullName) userName = fullName;
    }

    if (oeRaw) {
      const operators = extractList<OperateurRecord>(oeRaw);
      const normalizedUserId = normalizeId(userId);
      const current = operators.find((item) => {
        const linkedUserId = normalizeId(item.userId ?? item.user_id ?? null);
        return normalizedUserId !== null && linkedUserId === normalizedUserId;
      });

      if (current?.id) operateurId = current.id;

      const denomination = current?.organisation?.denomination;
      if (denomination) {
        companyName = denomination;
      } else if (current?.organisationId) {
        const orgRaw = await apiClient<unknown>(`/api/v1/organisations/${current.organisationId}`, { method: "GET" }).catch(() => null);
        const org = orgRaw ? unwrapEnvelope<{ denomination?: string }>(orgRaw) : null;
        if (org?.denomination) companyName = org.denomination;
      }
    }
  } catch {
    // Keep resilient defaults when identity endpoints are unavailable.
  }

  return { userId, userName, companyName, operateurId };
}

export async function getOperateurDashboardData(): Promise<OeDashboardData> {
  const identity = await getIdentityData();

  const [aosRaw, submissionsRaw, recoursRaw] = await Promise.all([
    apiClient<unknown>("/api/v1/appels-offres?page=1&limit=200", { method: "GET" }).catch(() => []),
    apiClient<unknown>(`/api/v1/soumissions?page=1&limit=200${identity.operateurId ? `&operateurId=${identity.operateurId}` : ''}`, { method: "GET" }).catch(() => []),
    identity.operateurId
      ? apiClient<unknown>(`/api/v1/recours/operateur/${identity.operateurId}`, { method: "GET" }).catch(() => [])
      : Promise.resolve([] as unknown),
  ]);

  const aos = extractList<AppelOffreRecord>(aosRaw);
  const submissions = extractList<SubmissionRecord>(submissionsRaw);
  const recours = extractList<RecoursRecord>(recoursRaw);

  const aoById = new Map(
    aos
      .map((ao) => {
        const id = normalizeId(ao.id);
        if (!id) return null;
        return [id, ao] as const;
      })
      .filter((entry): entry is readonly [string, AppelOffreRecord] => Boolean(entry)),
  );

  const activeStatuses = new Set(["PUBLIE", "EN_COURS", "OUVERTURE_PLIS", "EVALUATION"]);
  const aoActifs = aos.filter((item) => activeStatuses.has((item.statut || "").toUpperCase())).length;

  const recentSubmissions = submissions
    .map((item) => {
      const linkedAo = aoById.get(getSubmissionAoId(item) || "");
      const submittedAt = item.submittedAt || item.submitted_at || item.dateSoumission || item.date_soumission || item.createdAt || item.created_at || new Date().toISOString();
      return {
        id: item.id,
        aoReference: item.aoReference || item.appelOffre?.reference || item.appel_offre?.reference || linkedAo?.reference || "N/A",
        aoObject: item.aoObject || item.appelOffre?.objet || item.appel_offre?.objet || linkedAo?.objet || "Objet non renseigne",
        submittedAt,
        status: normalizeSubmissionStatus(item.statut || item.status),
      } satisfies OeSubmissionItem;
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const inProgressStatuses = new Set<OeSubmissionStatus>(["brouillon", "deposee", "recue", "evaluee"]);
  const soumissionsEnCours = recentSubmissions.filter((item) => inProgressStatuses.has(item.status)).length;
  const marchesRemportes = recentSubmissions.filter((item) => item.status === "retenue").length;

  const openRecours = recours
    .map((item) => {
      // FIX: Use aoById to extract Reference and Object properly!
      const aoId = normalizeId(item.appelOffreId || item.appel_offre_id || item.appelOffre?.id || item.appel_offre?.id);
      const linkedAo = aoById.get(aoId || "");
      
      return {
        id: item.id,
        aoReference: linkedAo?.reference || item.appelOffre?.reference || item.appel_offre?.reference || item.appelOffreId || item.appel_offre_id || "N/A",
        aoObject: linkedAo?.objet || item.appelOffre?.objet || item.appel_offre?.objet || "Objet non renseigne",
        depositedAt: item.dateDepot || item.date_depot || new Date().toISOString(),
        status: normalizeRecoursStatus(item.statut),
        motif: item.motif || "Motif non renseigne",
      };
    })
    .sort((a, b) => new Date(b.depositedAt).getTime() - new Date(a.depositedAt).getTime());

  const recoursOuverts = openRecours.filter((item) => item.status === "depose" || item.status === "en_examen").length;

  const deadlines = aos
    .filter(ao => activeStatuses.has((ao.statut || "").toUpperCase()))
    .map((ao) => {
      if (!ao.dateLimiteSoumission) return null;

      const deadlineDate = new Date(ao.dateLimiteSoumission);
      if (Number.isNaN(deadlineDate.getTime())) return null;

      const relative = toRelativeDue(deadlineDate);
      return {
        id: `deadline-${ao.id}`,
        title: ao.reference ? `Fin de depot - ${ao.reference}` : "Fin de depot",
        dueAt: relative.dueAt,
        urgency: relative.urgency,
        sortAt: deadlineDate.getTime(),
      };
    })
    .filter((item): item is { id: string; title: string; dueAt: string; urgency: "high" | "medium" | "low"; sortAt: number } => Boolean(item))
    .sort((a, b) => a.sortAt - b.sortAt)
    .slice(0, 3)
    .map(({ id, title, dueAt, urgency }) => ({ id, title, dueAt, urgency }));

  return {
    userName: identity.userName,
    companyName: identity.companyName,
    stats: {
      aoActifs,
      soumissionsEnCours,
      marchesRemportes,
      recoursOuverts,
    },
    activities: buildMockedActivities(recentSubmissions.length),
    deadlines,
    recentSubmissions: recentSubmissions.slice(0, 5),
    openRecours: openRecours.slice(0, 3),
  };
}

export async function getOperateurActivityFeed(): Promise<OeActivityItem[]> {
  try {
    const raw = await apiClient<unknown>("/api/v1/audit/activities?limit=10", { method: "GET" });

    if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
      const items = (raw as { data: unknown }).data;
      if (Array.isArray(items)) {
        return items.map((item: { id?: string; type?: string; title?: string; subtitle?: string; timestamp?: string }) => ({
          id: item.id || crypto.randomUUID(),
          type: (item.type || "NOTIFICATION") as OeActivityItem["type"],
          title: item.title || "Activite",
          subtitle: item.subtitle || "",
          timestamp: item.timestamp || new Date().toISOString(),
        }));
      }
    }
    return [];
  } catch {
    return [];
  }
}