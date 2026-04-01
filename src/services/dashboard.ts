import {
  listServiceContractantTenders,
  type ServiceContractantTenderItem,
  type ServiceContractantTenderStatus,
  type ServiceContractantTenderType,
} from "@/services/tenders";

export interface ServiceContractantDashboardStats {
  activeAos: number;
  pendingAttributions: number;
  openRecours: number;
  ongoingMarches: number;
}

export interface ServiceContractantActivityItem {
  id: string;
  type: "STATUS" | "SOUMISSION" | "RECOURS";
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface ServiceContractantAlertItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium";
}

export interface ServiceContractantDeadlineItem {
  id: string;
  title: string;
  dueAt: string;
}

export interface ServiceContractantDashboardData {
  userName: string;
  organizationName: string;
  stats: ServiceContractantDashboardStats;
  activities: ServiceContractantActivityItem[];
  alerts: ServiceContractantAlertItem[];
  deadlines: ServiceContractantDeadlineItem[];
}

/**
 * Centralized dashboard data source for service contractant role.
 * Replace this mocked response with backend mapping when API is available.
 */
export async function getServiceContractantDashboardData(): Promise<ServiceContractantDashboardData> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    userName: "Nadia Benyahia",
    organizationName: "Direction des Marches - Wilaya d'Alger",
    stats: {
      activeAos: 12,
      pendingAttributions: 5,
      openRecours: 2,
      ongoingMarches: 28,
    },
    activities: [
      {
        id: "act-1",
        type: "STATUS",
        title: "Statut AO #2023-045 mis a jour",
        subtitle: "L'appel d'offres est passe en phase Evaluation Technique.",
        timestamp: "Il y a 20 min",
      },
      {
        id: "act-2",
        type: "SOUMISSION",
        title: "Nouvelle soumission recue",
        subtitle: "Entreprise TechBuild SARL pour le lot 2.",
        timestamp: "Il y a 1 h",
      },
      {
        id: "act-3",
        type: "RECOURS",
        title: "Recours depose",
        subtitle: "Recours preliminaire de l'operateur MTR-Plus.",
        timestamp: "Hier",
      },
      {
        id: "act-4",
        type: "SOUMISSION",
        title: "Proces-verbal signe",
        subtitle: "PV de la commission d'ouverture valide.",
        timestamp: "Hier",
      },
      {
        id: "act-5",
        type: "STATUS",
        title: "Statut Marche #M23-011",
        subtitle: "Ordre de service notifie a l'attributaire.",
        timestamp: "2 oct.",
      },
    ],
    alerts: [
      {
        id: "al-1",
        title: "Divergence detectee",
        description:
          "Anomalie detectee entre les prix unitaires et le HT total.",
        severity: "high",
      },
    ],
    deadlines: [
      {
        id: "dl-1",
        title: "Fin de depot des plis - AO #2023-055",
        dueAt: "Demain, 09:00",
      },
      {
        id: "dl-2",
        title: "Reunion Commission Technique",
        dueAt: "Demain, 14:30",
      },
      {
        id: "dl-3",
        title: "Expiration delai recours - Marche #M23-32",
        dueAt: "Dans 2 jours",
      },
    ],
  };
}

export type {
  ServiceContractantTenderType,
  ServiceContractantTenderStatus,
  ServiceContractantTenderItem,
};

/**
 * AO list source for service contractant role.
 * Replace with API mapping when backend endpoint is ready.
 */
export async function getServiceContractantTenders(): Promise<
  ServiceContractantTenderItem[]
> {
  return listServiceContractantTenders();
}
