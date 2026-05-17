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

export async function getAdministratorDashboardData(): Promise<AdministratorDashboardData> {
  return mockedAdministratorDashboardData;
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
