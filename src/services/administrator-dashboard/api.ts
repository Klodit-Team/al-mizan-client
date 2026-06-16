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
import type { AIIncident } from "@/services/admin/incidents";

// ─── Raw audit activity returned by GET /audit/activities ─────────────────────

interface RawAuditActivity {
  id?: string;
  action?: string;
  entite?: string;
  entite_id?: string;
  details?: string;
  horodatage?: string;
  user_id?: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

/** Map a raw audit activity to the dashboard AdministratorActivityItem shape */
function mapAuditActivity(raw: RawAuditActivity, idx: number): AdministratorActivityItem {
  const action = (raw.action ?? "").toUpperCase();
  let type: AdministratorActivityType = "update";
  if (action.includes("SUBMIT") || action.includes("SOUMISSION")) type = "submission";
  else if (action.includes("RECOURS")) type = "recours";
  else if (action.includes("PV") || action.includes("DELIBERATION")) type = "pv";
  else if (action.includes("MARCHE")) type = "marche";

  return {
    id: raw.id ?? `activity-${idx}`,
    type,
    title: raw.action ?? "Activité",
    description: raw.details ?? `${raw.entite ?? ""} · ${raw.entite_id ?? ""}`,
    time: raw.horodatage ? new Date(raw.horodatage).toLocaleString() : "",
  };
}

/** Map a real AIIncident to the dashboard AdministratorAiAlert shape */
function mapIncidentToAlert(inc: AIIncident): AdministratorAiAlert {
  const severityMap: Record<string, "high" | "medium" | "low"> = {
    CRITIQUE: "high",
    ELEVEE:   "high",
    MOYENNE:  "medium",
    FAIBLE:   "low",
  };
  return {
    id: inc.id,
    severity: severityMap[inc.gravite] ?? "medium",
    title: inc.type_incident.replace(/_/g, " "),
    description: `${inc.entite_source} · Décision IA: ${inc.decision_ia} vs Humain: ${inc.decision_humaine || "—"} (écart ${(inc.ecart_score * 100).toFixed(0)}%)`,
    actionLabel: "Voir l'incident",
    actionHref: "/dashboard/admin/incidents",
  };
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
  // TODO: replace with real aggregation endpoint when available
  return { utilisateursActifs: 0, aoEnCours: 0, recoursOuverts: 0, incidentsIA: 0 };
}

/**
 * GET /api/v1/audit/activities
 */
export async function getAdministratorDashboardActivities(): Promise<AdministratorActivityItem[]> {
  try {
    const raw = await apiClient<RawAuditActivity[] | ApiEnvelope<RawAuditActivity[]>>(
      `/api/v1/audit/activities?limit=10`,
      { method: "GET" }
    );
    const activities = unwrapData(raw);
    if (Array.isArray(activities) && activities.length > 0) {
      return activities.map(mapAuditActivity);
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
      apiClient<AIIncident[] | ApiEnvelope<AIIncident[]>>(`/api/v1/incidents?gravite=ELEVEE&statut=OUVERT&limit=5`, { method: "GET" }),
      apiClient<AIIncident[] | ApiEnvelope<AIIncident[]>>(`/api/v1/incidents?gravite=CRITIQUE&statut=OUVERT&limit=5`, { method: "GET" }),
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
  // TODO: replace with real deadlines endpoint when available
  return [];
}

export async function getAdministratorDashboardSupportLinks(): Promise<AdministratorSupportLink[]> {
  return [];
}
