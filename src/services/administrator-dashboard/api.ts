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

const mockedAdministratorDashboardData: AdministratorDashboardData = {
  userName: "Ahmed Mansour",
  roleLabel: "Administrateur plateforme",
  stats: {
    utilisateursActifs: 128,
    aoEnCours: 24,
    recoursOuverts: 6,
    incidentsIA: 3,
  },
  activities: [
    {
      id: "admin-activity-1",
      type: "update",
      title: "Statut AO #2026-045 mis a jour",
      description: "L'appel d'offres est passe en phase Evaluation Technique.",
      time: "il y a 18 min",
    },
    {
      id: "admin-activity-2",
      type: "submission",
      title: "Nouvelle soumission recue",
      description: "Entreprise TechBuild SARL pour le lot 2 - Gros oeuvre.",
      time: "il y a 1h",
    },
    {
      id: "admin-activity-3",
      type: "recours",
      title: "Recours depose",
      description: "Recours precontractuel depose par BTP-Plus sur AO #2026-039.",
      time: "Hier",
    },
    {
      id: "admin-activity-4",
      type: "pv",
      title: "Proces-verbal signe",
      description: "PV de la commission d'ouverture des plis #2026-048 valide.",
      time: "Hier",
    },
    {
      id: "admin-activity-5",
      type: "marche",
      title: "Statut Marche #M26-011",
      description: "Ordre de service notifie a l'attributaire.",
      time: "14 mai",
    },
  ],
  aiAlerts: [
    {
      id: "admin-ai-alert-1",
      severity: "high",
      title: "Divergence detectee",
      description:
        "Anomalie detectee dans les prix unitaires de l'offre #LOT-3. Les prix sont 40% inferieurs a la moyenne etablie.",
      actionLabel: "Analyser le rapport",
      actionHref: "/dashboard/admin/incidents",
    },
    {
      id: "admin-ai-alert-2",
      severity: "medium",
      title: "Activite inhabituelle",
      description:
        "Plusieurs tentatives de connexion ont ete detectees sur un compte controleur.",
      actionLabel: "Voir les sessions",
      actionHref: "/dashboard/admin/sessions",
    },
  ],
  deadlines: [
    {
      id: "admin-deadline-1",
      type: "depot",
      title: "Fin de depot des plis",
      subtitle: "AO #2026-050 - Demain 10:00",
      time: "Demain",
    },
    {
      id: "admin-deadline-2",
      type: "commission",
      title: "Reunion Commission Technique",
      subtitle: "Salle 4B - Apres-demain 14:00",
      time: "J+2",
    },
    {
      id: "admin-deadline-3",
      type: "expiration",
      title: "Expiration delai recours",
      subtitle: "Marche #2026-041 - Demain 23:59",
      time: "Demain",
    },
  ],
  supportLinks: [
    {
      id: "admin-support-guide",
      label: "Guide des procedures 2026",
      href: "/dashboard/admin/journal-audit",
      type: "guide",
    },
    {
      id: "admin-support-contact",
      label: "Contacter le support technique",
      href: "/support",
      type: "support",
    },
  ],
};

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
  return mockedAdministratorDashboardData;
}

export async function getAdministratorDashboardStats(): Promise<AdministratorDashboardStats> {
  // TODO: replace with real aggregation endpoint when available
  return mockedAdministratorDashboardData.stats;
}

/**
 * GET /api/v1/audit/activities
 * Falls back to mocked data when the endpoint is unavailable.
 */
export async function getAdministratorDashboardActivities(): Promise<AdministratorActivityItem[]> {
  try {
    // The backend requires serviceContractantId OR operateurId — pass limit only for the
    // admin overview (the gateway may relax the required params for admin callers).
    const raw = await apiClient<RawAuditActivity[]>(
      `/api/v1/audit/activities?limit=10`,
      { method: "GET" }
    );
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(mapAuditActivity);
    }
  } catch {
    // Fall through to mock
  }
  return mockedAdministratorDashboardData.activities;
}

/**
 * GET /api/v1/incidents — fetch open ELEVEE/CRITIQUE incidents for the AI-alerts widget.
 * Falls back to mocked data when the endpoint is unavailable.
 */
export async function getAdministratorDashboardAiAlerts(): Promise<AdministratorAiAlert[]> {
  try {
    // Fetch high-severity open incidents
    const [elevee, critique] = await Promise.all([
      apiClient<AIIncident[]>(`/api/v1/incidents?gravite=ELEVEE&statut=OUVERT&limit=5`, { method: "GET" }),
      apiClient<AIIncident[]>(`/api/v1/incidents?gravite=CRITIQUE&statut=OUVERT&limit=5`, { method: "GET" }),
    ]);
    const combined = [
      ...(Array.isArray(critique) ? critique : []),
      ...(Array.isArray(elevee)   ? elevee   : []),
    ].slice(0, 5);
    if (combined.length > 0) {
      return combined.map(mapIncidentToAlert);
    }
  } catch {
    // Fall through to mock
  }
  return mockedAdministratorDashboardData.aiAlerts;
}

export async function getAdministratorDashboardDeadlines(): Promise<AdministratorDeadlineItem[]> {
  // TODO: replace with real deadlines endpoint when available
  return mockedAdministratorDashboardData.deadlines;
}

export async function getAdministratorDashboardSupportLinks(): Promise<AdministratorSupportLink[]> {
  return mockedAdministratorDashboardData.supportLinks;
}
