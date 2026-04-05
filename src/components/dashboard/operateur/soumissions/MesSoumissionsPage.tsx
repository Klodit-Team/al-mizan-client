"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  FileText, Search, Eye, Send, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, AlertCircle, BarChart2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubStatus =
  | "brouillon"
  | "deposee"
  | "recue"
  | "evaluee"
  | "retenue"
  | "rejetee";

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
    id: "SUB-005", aoReference: "AO-2023-041",
    aoObject: "Travaux d'aménagement des locaux administratifs",
    organizationName: "Direction Générale - Blida",
    lots: ["Lot unique – Gros œuvre et finitions"],
    submittedAt: "2023-09-10", deadline: "2023-09-25",
    status: "rejetee", montantOffre: "32 100 000 DZD",
  },
  {
    id: "SUB-006", aoReference: "AO-2024-010",
    aoObject: "Entretien préventif des équipements climatiques",
    organizationName: "Université de Sétif",
    lots: ["Lot 1 – Climatisation centrale"],
    submittedAt: "", deadline: "2024-12-01",
    status: "brouillon",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<SubStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  brouillon: { label: "Brouillon",   bg: "bg-slate-100",  text: "text-slate-600",  icon: <Clock       className="h-3 w-3" /> },
  deposee:   { label: "Déposée",    bg: "bg-blue-100",  text: "text-blue-700",   icon: <Send        className="h-3 w-3" /> },
  recue:     { label: "Reçue",       bg: "bg-sky-100",   text: "text-sky-700",    icon: <CheckCircle2 className="h-3 w-3" /> },
  evaluee:   { label: "Évaluée",    bg: "bg-violet-100",text: "text-violet-700", icon: <BarChart2   className="h-3 w-3" /> },
  retenue:   { label: "Retenue",      bg: "bg-emerald-100",text: "text-emerald-700",icon: <CheckCircle2 className="h-3 w-3" /> },
  rejetee:   { label: "Rejetée",    bg: "bg-rose-100",  text: "text-rose-700",   icon: <XCircle     className="h-3 w-3" /> },
};

const STATUS_FILTERS: Array<{ value: SubStatus | "all"; label: string }> = [
  { value: "all",      label: "Tous" },
  { value: "brouillon",label: "Brouillon" },
  { value: "deposee",  label: "Déposée" },
  { value: "recue",    label: "Reçue" },
  { value: "evaluee",  label: "Évaluée" },
  { value: "retenue",  label: "Retenue" },
  { value: "rejetee",  label: "Rejetée" },
];

const ITEMS_PER_PAGE = 5;

function fmt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, colorBg, colorText }: {
  label: string; value: number; colorBg: string; colorText: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-gray-200 p-4 shadow-sm ${colorBg}`}>
      <p className={`text-2xl font-bold ${colorText}`}>{String(value).padStart(2, "0")}</p>
      <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MesSoumissionsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [keyword, setKeyword]       = useState("");
  const [statusFilter, setStatus]   = useState<SubStatus | "all">("all");
  const [page, setPage]             = useState(1);

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

  // Stat counts
  const counts = useMemo(() => ({
    total:    MOCK.length,
    enCours:  MOCK.filter((s) => ["deposee","recue","evaluee"].includes(s.status)).length,
    retenues: MOCK.filter((s) => s.status === "retenue").length,
    rejetees: MOCK.filter((s) => s.status === "rejetee").length,
  }), []);

  return (
    <div className="space-y-3">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
            Mes Soumissions
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {filtered.length} soumission{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions/nouvelle`)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Send className="h-4 w-4" />
          Nouvelle soumission
        </button>
      </header>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total soumissions"  value={counts.total}    colorBg="from-slate-50 to-white bg-linear-to-br"    colorText="text-slate-800" />
        <SummaryCard label="En cours"           value={counts.enCours}  colorBg="from-blue-50 to-white bg-linear-to-br"     colorText="text-blue-700" />
        <SummaryCard label="Retenues"           value={counts.retenues} colorBg="from-emerald-50 to-white bg-linear-to-br"  colorText="text-emerald-700" />
        <SummaryCard label="Rejetées"          value={counts.rejetees} colorBg="from-rose-50 to-white bg-linear-to-br"     colorText="text-rose-700" />
      </section>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              placeholder="Référence, objet, organisme…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
            />
          </div>
          {/* Status pills */}
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
      </section>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto] border-b border-[#4CAF50]/10 bg-[#F6F7F6] px-4 py-2.5 sm:grid-cols-[200px_1fr_120px_100px_100px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Référence / AO</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:block">Objet</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:block">Date dépôt</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:block">Statut</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:block text-right">Actions</span>
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <FileText className="mb-3 h-9 w-9 opacity-30" />
            <p className="text-sm font-medium">Aucune soumission trouvée</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {paginated.map((sub) => {
              const meta = STATUS_META[sub.status];
              return (
                <li key={sub.id} className="grid grid-cols-1 gap-2 px-4 py-3 hover:bg-slate-50/60 transition-colors sm:grid-cols-[200px_1fr_120px_100px_100px] sm:items-center">
                  {/* Ref */}
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-700">{sub.aoReference}</span>
                    <p className="text-[10px] text-slate-400">{sub.id}</p>
                    {sub.montantOffre && (
                      <p className="mt-0.5 text-[10px] font-semibold text-[#364150]">{sub.montantOffre}</p>
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
                  {/* Status badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Voir le détail"
                      onClick={() => router.push(`/${locale}/dashboard/operateur/appels-offres/${sub.aoReference}`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {sub.status === "brouillon" && (
                      <button
                        type="button"
                        title="Continuer la soumission"
                        onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions/nouvelle?ao=${sub.aoReference}`)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {sub.status === "rejetee" && (
                      <span title="Rejetée" className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            {(page - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} type="button" onClick={() => setPage(i + 1)}
                className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] font-semibold transition-colors ${
                  page === i + 1 ? "border-[#4CAF50] bg-[#4CAF50] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>{i + 1}</button>
            ))}
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}