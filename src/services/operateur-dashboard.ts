
export type OeAoStatus =
  | "publie"
  | "en_cours"
  | "evaluation"
  | "attribue"
  | "annule"
  | "cloture";

export type OeAoType = "ouvert" | "restreint" | "gre_a_gre";

export type OeSubmissionStatus =
  | "brouillon"
  | "deposee"
  | "recue"
  | "evaluee"
  | "retenue"
  | "rejetee";

export type OeRecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

// ── AO (Appel d'Offres) seen by the operator ─────────────────────────────────

export interface OeAoItem {
  id: string;
  reference: string;
  object: string;
  type: OeAoType;
  /** ISO date string */
  deadline: string;
  status: OeAoStatus;
  organizationName: string;
  wilaya: string;
  sector: string;
  estimatedAmount?: string;
  /** Whether the operator has already submitted an offer */
  hasSubmission: boolean;
  submissionStatus?: OeSubmissionStatus;
  lots: OeAoLot[];
}

export interface OeAoLot {
  id: string;
  lotNumber: string;
  designation: string;
  estimatedAmount?: string;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface OeDashboardStats {
  aoActifs: number;
  soumissionsEnCours: number;
  marchesRemportes: number;
  recoursOuverts: number;
}

// ── Activity feed ─────────────────────────────────────────────────────────────

export interface OeActivityItem {
  id: string;
  type: "SOUMISSION" | "NOTIFICATION" | "RECOURS" | "RESULTAT";
  title: string;
  subtitle: string;
  timestamp: string;
}

// ── Upcoming deadlines ────────────────────────────────────────────────────────

export interface OeDeadlineItem {
  id: string;
  title: string;
  dueAt: string;
  urgency: "high" | "medium" | "low";
}

// ── My submissions ────────────────────────────────────────────────────────────

export interface OeSubmissionItem {
  id: string;
  aoReference: string;
  aoObject: string;
  submittedAt: string;
  status: OeSubmissionStatus;
}

// ── My recours ────────────────────────────────────────────────────────────────

export interface OeRecoursItem {
  id: string;
  aoReference: string;
  aoObject: string;
  depositedAt: string;
  status: OeRecoursStatus;
  motif: string;
}

// ── Full dashboard payload ────────────────────────────────────────────────────

export interface OeDashboardData {
  userName: string;
  companyName: string;
  stats: OeDashboardStats;
  activities: OeActivityItem[];
  deadlines: OeDeadlineItem[];
  recentSubmissions: OeSubmissionItem[];
  openRecours: OeRecoursItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — fetches from real backend via gateway
// ─────────────────────────────────────────────────────────────────────────────

import { getOperateurDashboardData } from "@/services/operateur-dashboard/api";

export async function getOeDashboardData(): Promise<OeDashboardData> {
  return getOperateurDashboardData();
}

// ─────────────────────────────────────────────────────────────────────────────
// AO listing — delegates to real backend
// ─────────────────────────────────────────────────────────────────────────────

import { listOperateurAppelsOffres, getOperateurAppelOffreById } from "@/services/operateur-appels-offres/api";

export async function listOeAos(): Promise<OeAoItem[]> {
  const items = await listOperateurAppelsOffres();
  return items as unknown as OeAoItem[];
}

export async function getOeAoById(id: string): Promise<OeAoItem | null> {
  const item = await getOperateurAppelOffreById(id);
  return item as unknown as OeAoItem | null;
}