"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  type OeSoumissionListItem,
  type OeSoumissionStatus,
} from "@/services/operateur-soumissions/api";
import { useOperateurSoumissionsQuery } from "@/services/operateur-soumissions/queries";
import {
  FileText, Search, Eye, Send, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, BarChart2, Pencil, Scale,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<OeSoumissionStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  brouillon: { label: "Brouillon", bg: "bg-slate-100",   text: "text-slate-600",   icon: <Clock className="h-3 w-3" /> },
  deposee:   { label: "Déposée",   bg: "bg-blue-100",    text: "text-blue-700",    icon: <Send className="h-3 w-3" /> },
  recue:     { label: "Reçue",     bg: "bg-sky-100",     text: "text-sky-700",     icon: <CheckCircle2 className="h-3 w-3" /> },
  evaluee:   { label: "Évaluée",   bg: "bg-violet-100",  text: "text-violet-700",  icon: <BarChart2 className="h-3 w-3" /> },
  retenue:   { label: "Retenue",   bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejetee:   { label: "Rejetée",   bg: "bg-rose-100",    text: "text-rose-700",    icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_FILTERS: Array<{ value: OeSoumissionStatus | "all"; label: string }> = [
  { value: "all",       label: "Toutes" },
  { value: "brouillon", label: "Brouillon" },
  { value: "deposee",   label: "Déposée" },
  { value: "recue",     label: "Reçue" },
  { value: "evaluee",   label: "Évaluée" },
  { value: "retenue",   label: "Retenue" },
  { value: "rejetee",   label: "Rejetée" },
];

const ITEMS_PER_PAGE = 6;

function fmt(iso: string, locale: Locale) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", { day: "numeric", month: "short", year: "numeric" });
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

export default function MesSoumissionsPage({ dict, locale }: { dict: any; locale: Locale }) {
  const router = useRouter();
  const { data = [], isLoading, isError } = useOperateurSoumissionsQuery();

  const [keyword, setKeyword]     = useState("");
  const [statusFilter, setStatus] = useState<OeSoumissionStatus | "all">("all");
  const [page, setPage]           = useState(1);

  const filtered = useMemo(() => data.filter((s) => {
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
  }), [data, keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = useMemo(() => ({
    total: data.length,
    enCours: data.filter((s) => ["deposee", "recue", "evaluee"].includes(s.status)).length,
    retenues: data.filter((s) => s.status === "retenue").length,
    rejetees: data.filter((s) => s.status === "rejetee").length,
  }), [data]);

  function getResumeDraftUrl(sub: OeSoumissionListItem) {
    const query = new URLSearchParams();
    if (sub.aoId) {
      query.set("aoId", sub.aoId);
    }
    if (sub.lotId) {
      query.set("lotId", sub.lotId);
    }

    const suffix = query.toString();
    return `/${locale}/dashboard/operateur/soumissions/nouvelle${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{dict.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{dict.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions/nouvelle`)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Send className="h-4 w-4" />
          {dict.newSubmission}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={dict.stats.total}      value={counts.total}    colorClass="text-slate-700"   iconBg="bg-slate-100"   icon={<FileText className="h-5 w-5" />} />
        <StatCard label={dict.stats.enCours}   value={counts.enCours}  colorClass="text-blue-700"    iconBg="bg-blue-100"    icon={<Clock className="h-5 w-5" />} />
        <StatCard label={dict.stats.retenues}   value={counts.retenues} colorClass="text-emerald-700" iconBg="bg-emerald-100" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label={dict.stats.rejetees}   value={counts.rejetees} colorClass="text-rose-700"    iconBg="bg-rose-100"    icon={<XCircle className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder={dict.searchPlaceholder}
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
              {f.value === "all" ? dict.filters.all : dict.filters[f.value] || f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="hidden sm:grid sm:grid-cols-[180px_1fr_120px_110px_90px] border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          {[dict.table.referenceId, dict.table.objectOrg, dict.table.dateDepot, dict.table.status, dict.table.actions].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2 px-4 py-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">{dict.empty.title}</p>
            <p className="mt-1 text-xs">{dict.empty.subtitle}</p>
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
                    <p className="text-[10px] text-slate-400">{sub.reference}</p>
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
                  <div className="text-xs text-slate-500">{fmt(sub.submittedAt, locale)}</div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
                      {meta.icon}
                      {dict.filters[sub.status] || meta.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title={dict.actions.view}
                      onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions/${sub.id}`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-[#4CAF50] hover:bg-emerald-50 hover:text-[#4CAF50]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {sub.status === "brouillon" && (
                      <button
                        type="button"
                        title={dict.actions.continue}
                        onClick={() => router.push(getResumeDraftUrl(sub))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#4CAF50] text-[#4CAF50] transition-colors hover:bg-[#4CAF50] hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {sub.eligibleRecours && (
                      <button
                        type="button"
                        title={dict.actions.recours}
                        onClick={() => {
                          const query = new URLSearchParams();
                          query.set("ao", sub.aoReference);
                          query.set("aoId", sub.aoId);
                          query.set("objet", sub.aoObject);
                          router.push(`/${locale}/dashboard/operateur/recours/deposer?${query.toString()}`);
                        }}
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

      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {dict.errorLoading}
        </div>
      )}

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