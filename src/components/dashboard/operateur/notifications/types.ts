// ─── Notification types ────────────────────────────────────────────────────────

export type NotifCategory =
  | "publication_ao"
  | "depot_confirme"
  | "ouverture_plis"
  | "evaluation_resultat"
  | "attribution_provisoire"
  | "attribution_definitive"
  | "recours_update"
  | "systeme";

export interface NotifItem {
  id: string;
  titre: string;
  contenu: string;
  categorie: NotifCategory;
  dateEnvoi: string;
  lu: boolean;
}

// ─── Category meta ─────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<NotifCategory, { label: string; bg: string; text: string }> = {
  publication_ao:       { label: "Publication AO",       bg: "bg-sky-100",     text: "text-sky-700" },
  depot_confirme:       { label: "Dépôt confirmé",       bg: "bg-blue-100",    text: "text-blue-700" },
  ouverture_plis:       { label: "Ouverture des plis",   bg: "bg-violet-100",  text: "text-violet-700" },
  evaluation_resultat:  { label: "Résultat évaluation",  bg: "bg-amber-100",   text: "text-amber-700" },
  attribution_provisoire: { label: "Attribution prov.",  bg: "bg-orange-100",  text: "text-orange-700" },
  attribution_definitive: { label: "Attribution déf.",   bg: "bg-emerald-100", text: "text-emerald-700" },
  recours_update:       { label: "Recours",              bg: "bg-rose-100",    text: "text-rose-700" },
  systeme:              { label: "Système",              bg: "bg-slate-100",   text: "text-slate-600" },
};

export const CATEGORY_FILTERS: Array<{ value: NotifCategory | "all"; label: string }> = [
  { value: "all",                   label: "Toutes" },
  { value: "publication_ao",        label: "Publication AO" },
  { value: "depot_confirme",        label: "Dépôt confirmé" },
  { value: "ouverture_plis",        label: "Ouverture plis" },
  { value: "evaluation_resultat",   label: "Évaluation" },
  { value: "attribution_provisoire",label: "Attribution prov." },
  { value: "attribution_definitive",label: "Attribution déf." },
  { value: "recours_update",        label: "Recours" },
  { value: "systeme",               label: "Système" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_NOTIFS: NotifItem[] = [
  {
    id: "N-001",
    titre: "Nouveau recours : REC-2024-001",
    contenu: "Votre recours REC-2024-001 contre l'attribution provisoire de l'AO-2024-003 a été accepté par la commission des marchés. Une réévaluation de votre offre technique sera effectuée.",
    categorie: "recours_update",
    dateEnvoi: "2024-11-18T10:23:00",
    lu: false,
  },
  {
    id: "N-002",
    titre: "Attribution provisoire — AO-2024-009",
    contenu: "L'attribution provisoire pour l'AO-2024-009 (Fourniture de véhicules utilitaires) a été prononcée. Vous n'avez pas été retenu. Vous disposez de 15 jours pour déposer un recours.",
    categorie: "attribution_provisoire",
    dateEnvoi: "2024-12-15T09:00:00",
    lu: false,
  },
  {
    id: "N-003",
    titre: "Dépôt confirmé — AO-2024-012",
    contenu: "Votre soumission pour l'AO-2024-012 (Travaux de rénovation du siège administratif) a bien été enregistrée. Horodatage serveur : 01/12/2024 à 14h33. Référence : SUB-2024-012.",
    categorie: "depot_confirme",
    dateEnvoi: "2024-12-01T14:33:00",
    lu: true,
  },
  {
    id: "N-004",
    titre: "Résultats d'évaluation disponibles — AO-2024-007",
    contenu: "Les résultats de l'évaluation technique et financière pour l'AO-2024-007 sont disponibles. Votre offre a obtenu un score technique de 72/100. Consultez le rapport d'évaluation.",
    categorie: "evaluation_resultat",
    dateEnvoi: "2024-11-30T16:45:00",
    lu: true,
  },
  {
    id: "N-005",
    titre: "Séance d'ouverture des plis — AO-2024-012",
    contenu: "La séance d'ouverture des plis technique et financier pour l'AO-2024-012 est programmée pour le 15/12/2024 à 10h00 au siège de la Direction Générale. La séance est publique.",
    categorie: "ouverture_plis",
    dateEnvoi: "2024-12-05T08:00:00",
    lu: false,
  },
  {
    id: "N-006",
    titre: "Nouveau AO publié — Secteur IT",
    contenu: "Un nouvel appel d'offres AO-2025-001 a été publié dans votre secteur d'activité : Maintenance et support des infrastructures informatiques. Date limite de dépôt : 15/01/2025.",
    categorie: "publication_ao",
    dateEnvoi: "2024-12-10T07:30:00",
    lu: false,
  },
  {
    id: "N-007",
    titre: "Attribution définitive — AO-2024-003",
    contenu: "Suite à l'acceptation de votre recours, l'attribution définitive de l'AO-2024-003 vous a été accordée. Votre offre a été retenue pour un montant de 59 500 000 DZD. Vous serez contacté prochainement.",
    categorie: "attribution_definitive",
    dateEnvoi: "2024-12-02T11:15:00",
    lu: true,
  },
  {
    id: "N-008",
    titre: "Maintenance planifiée de la plateforme",
    contenu: "Une maintenance de la plateforme AL-MIZAN est prévue le dimanche 17 décembre 2024 de 02h00 à 06h00. La plateforme sera temporairement inaccessible durant cette période.",
    categorie: "systeme",
    dateEnvoi: "2024-12-11T09:00:00",
    lu: true,
  },
  {
    id: "N-009",
    titre: "Recours REC-2024-003 rejeté",
    contenu: "Votre recours REC-2024-003 concernant l'AO-2024-007 a été examiné par la commission des marchés et a été rejeté. La décision motivée est disponible dans le détail de votre recours.",
    categorie: "recours_update",
    dateEnvoi: "2024-10-29T15:30:00",
    lu: true,
  },
  {
    id: "N-010",
    titre: "Nouveau AO publié — Secteur BTP",
    contenu: "L'AO-2024-015 a été publié : Réalisation de la piste cyclable et aménagement urbain — Commune de Chéraga. Budget estimé : 320 000 000 DZD. Date limite : 30/01/2025.",
    categorie: "publication_ao",
    dateEnvoi: "2024-12-08T10:00:00",
    lu: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7)   return `Il y a ${days}j`;
  return d.toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" });
}