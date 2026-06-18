"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  type OeAoItem,
  type OeAoLot,
  type OeAoStatus,
  type OeAoType,
} from "@/services/operateur-appels-offres/api";
import { useOperateurAppelsOffresQuery } from "@/services/operateur-appels-offres/queries";
import { type Locale } from "@/i18n/config";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OeAoStatus, string> = {
  publie: "Publié",
  en_cours: "En cours",
  evaluation: "Évaluation",
  attribue: "Attribué",
  annule: "Annulé",
  cloture: "Clôturé",
};

const TYPE_LABELS: Record<OeAoType, string> = {
  ouvert: "Appel d'offres ouvert",
  restreint: "Appel d'offres restreint",
  gre_a_gre: "Gré à gré",
};

function statusBadgeClass(status: OeAoStatus) {
  switch (status) {
    case "publie":      return "bg-blue-100 text-blue-700 border-blue-200";
    case "en_cours":   return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "evaluation": return "bg-violet-100 text-violet-700 border-violet-200";
    case "attribue":   return "bg-amber-100 text-amber-700 border-amber-200";
    case "annule":     return "bg-slate-100 text-slate-500 border-slate-200";
    case "cloture":    return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function typeBadgeClass(type: OeAoType) {
  switch (type) {
    case "ouvert":    return "bg-sky-50 text-sky-700";
    case "restreint": return "bg-orange-50 text-orange-700";
    case "gre_a_gre": return "bg-rose-50 text-rose-700";
  }
}

function formatDeadline(iso: string, locale: Locale) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const label = d.toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", { day: "numeric", month: "short", year: "numeric" });
  if (diff < 0) return { label, urgency: "expired" as const };
  if (diff <= 3) return { label, urgency: "high" as const };
  if (diff <= 7) return { label, urgency: "medium" as const };
  return { label, urgency: "low" as const };
}

function deadlineClass(urgency: ReturnType<typeof formatDeadline>["urgency"]) {
  switch (urgency) {
    case "expired": return "text-slate-400 line-through";
    case "high":    return "text-rose-600 font-semibold";
    case "medium":  return "text-amber-600 font-medium";
    case "low":     return "text-slate-600";
  }
}

function getPaginationRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4)
    return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

const ALL_STATUSES: Array<{ value: OeAoStatus | "all"; label: string }> = [
  { value: "all", label: "Tous les statuts" },
  { value: "publie", label: "Publié" },
  { value: "en_cours", label: "En cours" },
  { value: "evaluation", label: "Évaluation" },
  { value: "attribue", label: "Attribué" },
  { value: "annule", label: "Annulé" },
];

const ALL_TYPES: Array<{ value: OeAoType | "all"; label: string }> = [
  { value: "all", label: "Tous les types" },
  { value: "ouvert", label: "Ouvert" },
  { value: "restreint", label: "Restreint" },
  { value: "gre_a_gre", label: "Gré à gré" },
];

interface Filters {
  keyword: string;
  status: OeAoStatus | "all";
  type: OeAoType | "all";
  wilaya: string;
  hasSubmission: "all" | "yes" | "no";
}

const ITEMS_PER_PAGE = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function OeAoListPage({ dict, locale }: { dict: any; locale: Locale }) {
  const router = useRouter();

  const { data = [], isLoading } = useOperateurAppelsOffresQuery();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    keyword: "",
    status: "all",
    type: "all",
    wilaya: "",
    hasSubmission: "all",
  });

  const wilayas = useMemo(
    () => Array.from(new Set(data.map((d) => d.wilaya))).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    return data.filter((ao) => {
      if (filters.status !== "all" && ao.status !== filters.status) return false;
      if (filters.type !== "all" && ao.type !== filters.type) return false;
      if (filters.wilaya && ao.wilaya !== filters.wilaya) return false;
      if (filters.hasSubmission === "yes" && !ao.hasSubmission) return false;
      if (filters.hasSubmission === "no" && ao.hasSubmission) return false;
      if (filters.keyword.trim()) {
        const kw = filters.keyword.toLowerCase();
        if (
          !ao.reference.toLowerCase().includes(kw) &&
          !ao.object.toLowerCase().includes(kw) &&
          !ao.organizationName.toLowerCase().includes(kw)
        ) return false;
      }
      return true;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const activeFilterCount = [
    filters.status !== "all",
    filters.type !== "all",
    !!filters.wilaya,
    filters.hasSubmission !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setPage(1);
    setFilters({ keyword: "", status: "all", type: "all", wilaya: "", hasSubmission: "all" });
  };

  const handleView = (id: string) =>
    router.push(`/${locale}/dashboard/operateur/appels-offres/${id}`);

  return (
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
            {dict.title}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {isLoading
              ? dict.loading
              : `${filtered.length} ${filtered.length !== 1 ? dict.countLabelPlural : dict.countLabel}`}
          </p>
        </div>
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilter("keyword", e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`relative inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-[#4CAF50] bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {dict.filtersBtn}
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4CAF50] text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Filter panel ────────────────────────────────────────────────────── */}
      {showFilters && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {dict.advancedFilters}
            </h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-700"
              >
                <X className="h-3 w-3" />
                {dict.reset}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {dict.labels.status}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilter("status", e.target.value as Filters["status"])}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#4CAF50]"
              >
                <option value="all">{dict.values.allStatuses}</option>
                <option value="publie">{dict.statusLabels.publie}</option>
                <option value="en_cours">{dict.statusLabels.en_cours}</option>
                <option value="evaluation">{dict.statusLabels.evaluation}</option>
                <option value="attribue">{dict.statusLabels.attribue}</option>
                <option value="annule">{dict.statusLabels.annule}</option>
              </select>
            </div>
            {/* Type */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {dict.labels.type}
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilter("type", e.target.value as Filters["type"])}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#4CAF50]"
              >
                <option value="all">{dict.values.allTypes}</option>
                <option value="ouvert">{dict.typeLabels.ouvert}</option>
                <option value="restreint">{dict.typeLabels.restreint}</option>
                <option value="gre_a_gre">{dict.typeLabels.gre_a_gre}</option>
              </select>
            </div>
            {/* Wilaya */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {dict.labels.wilaya}
              </label>
              <select
                value={filters.wilaya}
                onChange={(e) => setFilter("wilaya", e.target.value)}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#4CAF50]"
              >
                <option value="">{dict.values.allWilayas}</option>
                {wilayas.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            {/* Has submission */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {dict.labels.mySubmission}
              </label>
              <select
                value={filters.hasSubmission}
                onChange={(e) => setFilter("hasSubmission", e.target.value as Filters["hasSubmission"])}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#4CAF50]"
              >
                <option value="all">{dict.values.all}</option>
                <option value="yes">{dict.values.alreadySubmitted}</option>
                <option value="no">{dict.values.notSubmitted}</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400 shadow-sm">
          <FileText className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">{dict.empty.title}</p>
          <p className="mt-1 text-xs">{dict.empty.subtitle}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((ao) => {
            const dl = formatDeadline(ao.deadline, locale);
            return (
              <article
                key={ao.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#4CAF50]/40 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {dict.card.reference} {ao.reference}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${statusBadgeClass(ao.status)}`}
                      >
                        {dict.statusLabels[ao.status]}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-px text-[10px] font-medium ${typeBadgeClass(ao.type)}`}
                      >
                        {dict.typeLabels[ao.type]}
                      </span>
                      {ao.hasSubmission && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-px text-[10px] font-semibold text-emerald-700">
                          <FileText className="h-2.5 w-2.5" />
                          {dict.card.submitted}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-slate-800 leading-snug">
                      {ao.object}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ao.organizationName} &middot; {ao.wilaya}
                    </p>
                    {ao.estimatedAmount && (
                      <p className="mt-1 text-[11px] font-medium text-slate-700">
                        {dict.card.estimatedAmount} :{" "}
                        <span className="text-[#364150]">{ao.estimatedAmount}</span>
                      </p>
                    )}
                    {/* Lots */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ao.lots.map((lot: OeAoLot) => (
                        <span
                          key={lot.id}
                          className="inline-flex rounded-md bg-slate-100 px-2 py-px text-[10px] text-slate-600"
                        >
                          Lot {lot.lotNumber} – {lot.designation}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Right */}
                  <div className="flex shrink-0 flex-col items-end gap-2 md:pl-4">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Date limite
                      </p>
                      <p className={`text-[11px] ${deadlineClass(dl.urgency)}`}>
                        {dl.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleView(ao.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#4CAF50] px-3 py-1.5 text-[11px] font-semibold text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {dict.card.viewDetail}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {!isLoading && filtered.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm md:flex-row">
          <p>
            {dict.pagination.displaying} {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} {dict.pagination.of} {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {getPaginationRange(page, totalPages).map((item, i) =>
              item === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-7 w-7 items-center justify-center text-slate-400 text-xs select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item as number)}
                  className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] font-semibold transition-colors ${
                    page === item
                      ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}