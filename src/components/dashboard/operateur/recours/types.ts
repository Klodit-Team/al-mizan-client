import type { RecoursStatus } from "@/services/operateur-recours/api";
export type { RecoursStatus };

// ─── Status helpers ────────────────────────────────────────────────────────────

export const STATUS_META: Record<
  RecoursStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  depose:     { label: "Déposé",     bg: "bg-slate-100",   text: "text-slate-600",   border: "border-slate-200" },
  en_examen:  { label: "En examen",  bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
  accepte:    { label: "Accepté",    bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  rejete:     { label: "Rejeté",     bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
};

export function fmt(iso: string, locale: string = "fr") {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isDeadlineUrgent(dateLimite: string): boolean {
  const diff = new Date(dateLimite).getTime() - Date.now();
  return diff < 3 * 24 * 60 * 60 * 1000; // less than 3 days
}

export function isDeadlinePast(dateLimite: string): boolean {
  return new Date(dateLimite).getTime() < Date.now();
}