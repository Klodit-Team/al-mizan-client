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
  typeAlerte?: string;
  emittedAt?: string;
  actionLabel?: string;
  actionHref?: string;
}

const URGENCE_TO_SEVERITY: Record<string, "high" | "medium" | "low"> = {
  CRITIQUE: "high",
  ELEVEE: "high",
  MOYENNE: "medium",
  FAIBLE: "low",
};

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
      actionHref: "/dashboard/admin/id/incidents",
    },
    {
      id: "admin-ai-alert-2",
      severity: "medium",
      title: "Activite inhabituelle",
      description:
        "Plusieurs tentatives de connexion ont ete detectees sur un compte controleur.",
      actionLabel: "Voir les sessions",
      actionHref: "/dashboard/admin/id/sessions",
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
      href: "/dashboard/admin/id/journal-audit",
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

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface PaginatedPayload<T> {
  data: T[];
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    ("success" in (payload as Record<string, unknown>) || "statusCode" in (payload as Record<string, unknown>))
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);
  if (Array.isArray(unwrapped)) return unwrapped as T[];
  if (unwrapped && typeof unwrapped === "object" && Array.isArray((unwrapped as PaginatedPayload<T>).data)) {
    return (unwrapped as PaginatedPayload<T>).data;
  }
  return [];
}

export async function getAdministratorDashboardData(): Promise<AdministratorDashboardData> {
  try {
    const [aosRaw, recoursRaw, alertsRaw] = await Promise.all([
      apiClient<unknown>("/api/v1/appels-offres?page=1&limit=200", { method: "GET" }).catch(() => []),
      apiClient<unknown>("/api/v1/recours?page=1&limit=100", { method: "GET" }).catch(() => []),
      apiClient<unknown>("/api/v1/alertes-ia?page=1&limit=10", { method: "GET" }).catch(() => []),
    ]);

    const aos = extractList<{ id: string; statut?: string; dateLimiteSoumission?: string; reference?: string }>(aosRaw);
    const recours = extractList<{ id: string; statut?: string }>(recoursRaw);
    const alerts = extractList<{
      id: string;
      niveauUrgence?: string;
      typeAlerte?: string;
      message?: string;
      titre?: string;
      createdAt?: string;
      // legacy fallbacks
      severity?: string;
      title?: string;
      description?: string;
    }>(alertsRaw);

    const activeStatuses = new Set(["PUBLIE", "EN_COURS", "OUVERTURE_PLIS", "EVALUATION"]);
    const aoEnCours = aos.filter((ao) => activeStatuses.has((ao.statut || "").toUpperCase())).length;
    const recoursOuverts = recours.filter((r) => {
      const s = (r.statut || "").toUpperCase();
      return s === "DEPOSE" || s === "EN_EXAMEN";
    }).length;

    const aiAlerts: AdministratorAiAlert[] = alerts.slice(0, 3).map((a) => ({
      id: a.id,
      severity: URGENCE_TO_SEVERITY[a.niveauUrgence ?? ""] ?? (a.severity as "high" | "medium" | "low") ?? "medium",
      title: a.titre || a.title || "Alerte IA",
      description: a.message || a.description || "",
      typeAlerte: a.typeAlerte,
      emittedAt: a.createdAt,
    }));

    const deadlines: AdministratorDeadlineItem[] = aos
      .filter((ao) => ao.dateLimiteSoumission)
      .map((ao) => ({
        id: `deadline-${ao.id}`,
        type: "depot" as const,
        title: `Fin de depot - ${ao.reference || ao.id}`,
        subtitle: ao.dateLimiteSoumission || "",
        time: ao.dateLimiteSoumission || "",
      }))
      .slice(0, 3);

    return {
      userName: "Administrateur",
      roleLabel: "Administrateur plateforme",
      stats: {
        utilisateursActifs: 0,
        aoEnCours,
        recoursOuverts,
        incidentsIA: alerts.length,
      },
      activities: mockedAdministratorDashboardData.activities,
      aiAlerts,
      deadlines,
      supportLinks: mockedAdministratorDashboardData.supportLinks,
    };
  } catch {
    return mockedAdministratorDashboardData;
  }
}

export async function getAdministratorDashboardStats(): Promise<AdministratorDashboardStats> {
  const dashboard = await getAdministratorDashboardData();
  return dashboard.stats;
}

export async function getAdministratorDashboardActivities(): Promise<AdministratorActivityItem[]> {
  const dashboard = await getAdministratorDashboardData();
  return dashboard.activities;
}

export async function getAdministratorDashboardAiAlerts(): Promise<AdministratorAiAlert[]> {
  const dashboard = await getAdministratorDashboardData();
  return dashboard.aiAlerts;
}

export async function getAdministratorDashboardDeadlines(): Promise<AdministratorDeadlineItem[]> {
  const dashboard = await getAdministratorDashboardData();
  return dashboard.deadlines;
}

export async function getAdministratorDashboardSupportLinks(): Promise<AdministratorSupportLink[]> {
  const dashboard = await getAdministratorDashboardData();
  return dashboard.supportLinks;
}
