"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  FileText, Search, Eye, Send, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, BarChart2, Pencil, Scale,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubStatus = "brouillon" | "deposee" | "recue" | "evaluee" | "retenue" | "rejetee";

interface SoumissionItem {
  id: string;
  aoReference: string;
  aoObject: string;
  organizationName: string;
  lots: string[];
  submittedAt: string;
  deadline: string;
  status: SubStatus;
  montantOffre?: string;
  /** Whether the soumission is eligible for recours (ATTRIBUTION_PROVISOIRE and OE not retained) */
  eligibleRecours?: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK: SoumissionItem[] = [
  {
    id: "SUB-001", aoReference: "AO-2024-001",
    aoObject: "Fourniture et installation d'équipements informatiques",
    organizationName: "Direction des Systèmes d'Information - Alger",
    lots: ["Lot 1 : Serveurs et réseaux", "Lot 2 : Postes de travail"],
    submittedAt: "2024-10-28", deadline: "2024-11-15",
    status: "deposee", montantOffre: "44 200 000 DZD",
  },
  {
    id: "SUB-002", aoReference: "AO-2024-003",
    aoObject: "Acquisition de matériel médical spécialisé",
    organizationName: "CHU Mustapha Pacha - Alger",
    lots: ["Lot 1 – Équipements de radiologie"],
    submittedAt: "2024-10-20", deadline: "2024-10-30",
    status: "evaluee", montantOffre: "59 500 000 DZD",
  },
  {
    id: "SUB-003", aoReference: "AO-2024-006",
    aoObject: "Fourniture de mobilier de bureau pour administrations",
    organizationName: "Wilaya d'Annaba",
    lots: ["Lot 1 – Mobilier standard", "Lot 2 – Mobilier direction"],
    submittedAt: "2024-10-05", deadline: "2024-11-08",
    status: "retenue", montantOffre: "8 350 000 DZD",
  },
  {
    id: "SUB-004", aoReference: "AO-2024-007",
    aoObject: "Développement et déploiement d'une application métier",
    organizationName: "Ministère des Finances - DSI",
    lots: ["Lot 1 – Développement logiciel"],
    submittedAt: "2024-10-15", deadline: "2024-11-28",
    status: "recue", montantOffre: "19 800 000 DZD",
  },
  {
    id: "SUB-005", aoReference: "AO-2024-005",
    aoObject: "Réhabilitation du réseau d'assainissement — Wilaya de Béjaïa",
    organizationName: "Direction de l'hydraulique — Béjaïa",
    lots: ["Lot unique – Génie civil"],
    submittedAt: "2024-11-30", deadline: "2026-12-28",
    status: "rejetee", montantOffre: "91 000 000 DZD",
    eligibleRecours: true,
  },
  {
    id: "SUB-006", aoReference: "AO-2024-010",
    aoObject: "Entretien préventif des équipements climatiques",
    organizationName: "Université de Sétif",
    lots: ["Lot 1 – Climatisation centrale"],
    submittedAt: "", deadline: "2024-12-01",
    status: "brouillon",
  },
  {
    id: "SUB-007", aoReference: "AO-2024-010",
    aoObject: "Entretien préventif des équipements climatiques",
    organizationName: "Université de Sétif",
    lots: ["Lot 1 – Climatisation centrale"],
    submittedAt: "", deadline: "2024-12-01",
    status: "brouillon",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<SubStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  brouillon: { label: "Brouillon", bg: "bg-slate-100",   text: "text-slate-600",   icon: <Clock className="h-3 w-3" /> },
  deposee:   { label: "Déposée",   bg: "bg-blue-100",    text: "text-blue-700",    icon: <Send className="h-3 w-3" /> },
  recue:     { label: "Reçue",     bg: "bg-sky-100",     text: "text-sky-700",     icon: <CheckCircle2 className="h-3 w-3" /> },
  evaluee:   { label: "Évaluée",   bg: "bg-violet-100",  text: "text-violet-700",  icon: <BarChart2 className="h-3 w-3" /> },
  retenue:   { label: "Retenue",   bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejetee:   { label: "Rejetée",   bg: "bg-rose-100",    text: "text-rose-700",    icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_FILTERS: Array<{ value: SubStatus | "all"; label: string }> = [
  { value: "all",       label: "Toutes" },
  { value: "brouillon", label: "Brouillon" },
  { value: "deposee",   label: "Déposée" },
  { value: "recue",     label: "Reçue" },
  { value: "evaluee",   label: "Évaluée" },
  { value: "retenue",   label: "Retenue" },
  { value: "rejetee",   label: "Rejetée" },
];

const ITEMS_PER_PAGE = 6;

function fmt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, colorClass, iconBg, icon }: {
  label: string; value: number; colorClass: string; iconBg: string; icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MesSoumissionsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [keyword, setKeyword]     = useState("");
  const [statusFilter, setStatus] = useState<SubStatus | "all">("all");
  const [page, setPage]           = useState(1);

  const filtered = useMemo(() => MOCK.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      if (
        !s.aoReference.toLowerCase().includes(kw) &&
        !s.aoObject.toLowerCase().includes(kw) &&
        !s.organizationName.toLowerCase().includes(kw)
      ) return false;
    }
    return true;
  }), [keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = useMemo(() => ({
    total:    MOCK.length,
    enCours:  MOCK.filter((s) => ["deposee", "recue", "evaluee"].includes(s.status)).length,
    retenues: MOCK.filter((s) => s.status === "retenue").length,
    rejetees: MOCK.filter((s) => s.status === "rejetee").length,
  }), []);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mes Soumissions</h1>
          <p className="mt-0.5 text-sm text-slate-500">Suivi de vos offres déposées et en cours</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions/nouvelle`)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Send className="h-4 w-4" />
          Nouvelle soumission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total"      value={counts.total}    colorClass="text-slate-700"   iconBg="bg-slate-100"   icon={<FileText className="h-5 w-5" />} />
        <StatCard label="En cours"   value={counts.enCours}  colorClass="text-blue-700"    iconBg="bg-blue-100"    icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Retenues"   value={counts.retenues} colorClass="text-emerald-700" iconBg="bg-emerald-100" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Rejetées"   value={counts.rejetees} colorClass="text-rose-700"    iconBg="bg-rose-100"    icon={<XCircle className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Référence, objet, organisme…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                statusFilter === f.value
                  ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="hidden sm:grid sm:grid-cols-[180px_1fr_120px_110px_90px] border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          {["Référence / ID", "Objet & Organisme", "Date dépôt", "Statut", "Actions"].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">Aucune soumission trouvée</p>
            <p className="mt-1 text-xs">Modifiez vos filtres ou déposez une nouvelle soumission</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {paginated.map((sub) => {
              const meta = STATUS_META[sub.status];
              return (
                <li key={sub.id}
                  className="grid grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:grid-cols-[180px_1fr_120px_110px_90px] sm:items-center">

                  {/* Ref */}
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-700">{sub.aoReference}</span>
                    <p className="text-[10px] text-slate-400">{sub.id}</p>
                    {sub.montantOffre && (
                      <p className="mt-0.5 text-[10px] font-semibold text-slate-600">{sub.montantOffre}</p>
                    )}
                  </div>

                  {/* Object + lots */}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{sub.aoObject}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">{sub.organizationName}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sub.lots.map((lot) => (
                        <span key={lot} className="inline-flex rounded bg-slate-100 px-1.5 py-px text-[9px] text-slate-600">
                          {lot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-500">{fmt(sub.submittedAt)}</div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Voir le détail"
                      onClick={() => router.push(`/${locale}/dashboard/operateur/appels-offres/${sub.aoReference}`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-[#4CAF50] hover:bg-emerald-50 hover:text-[#4CAF50]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {sub.status === "brouillon" && (
                      <button
                        type="button"
                        title="Continuer la soumission"
                        onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions/nouvelle?ao=${sub.aoReference}`)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#4CAF50] text-[#4CAF50] transition-colors hover:bg-[#4CAF50] hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {sub.eligibleRecours && (
                      <button
                        type="button"
                        title="Déposer un recours"
                        onClick={() => router.push(`/${locale}/dashboard/operateur/recours/deposer?ao=${sub.aoReference}`)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                      >
                        <Scale className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} type="button" onClick={() => setPage(i + 1)}
                className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] font-semibold transition-colors ${
                  page === i + 1 ? "border-[#4CAF50] bg-[#4CAF50] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>{i + 1}</button>
            ))}
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}