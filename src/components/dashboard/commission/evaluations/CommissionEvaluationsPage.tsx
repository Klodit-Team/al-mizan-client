"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCommissionsEvaluationQuery } from "@/services/commission-dashboard/queries";
import type { CommissionEvaluation } from "@/services/commission-dashboard/api";

interface Props {
  locale: string;
}

type StatutView = "ACTIVE" | "BROUILLON" | "CLOTUREE" | "ANNULEE";

function statusLabel(statut: string, isAr: boolean) {
  switch (statut) {
    case "ACTIVE":
      return isAr ? "نشطة" : "Active";
    case "BROUILLON":
      return isAr ? "مسودة" : "Brouillon";
    case "CLOTUREE":
      return isAr ? "مغلقة" : "Clôturée";
    case "ANNULEE":
      return isAr ? "ملغاة" : "Annulée";
    default:
      return statut;
  }
}

function statusClasses(statut: string) {
  switch (statut) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "CLOTUREE":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "ANNULEE":
      return "bg-rose-50 text-rose-700 border-rose-100";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
}

function formatDate(value?: string | null, locale: string = "fr") {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function EmptyState({ isAr }: { isAr: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-900">
        {isAr ? "لا توجد لجان تقييم" : "Aucune commission d'évaluation"}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {isAr
          ? "لم يعُد الخادم أي لجنة تقييم حتى الآن."
          : "Le backend n'a renvoyé aucune commission d'évaluation."}
      </p>
    </div>
  );
}

function CommissionCard({
  locale,
  commission,
}: {
  locale: string;
  commission: CommissionEvaluation;
}) {
  const isAr = locale === "ar";
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.18em] text-slate-500">
            {commission.reference}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{commission.objet}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(commission.statut)}`}>
          {statusLabel(commission.statut, isAr)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {isAr ? "تاريخ الإنشاء" : "Créée le"}
          </p>
          <p className="mt-1 font-medium text-slate-800">{formatDate(commission.dateCreation, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {isAr ? "تاريخ الاجتماع" : "Date réunion"}
          </p>
          <p className="mt-1 font-medium text-slate-800">{formatDate(commission.dateReunion, locale)}</p>
        </div>
      </div>

      {commission.observations && (
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {commission.observations}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {isAr ? "الرئيس" : "Président"}: <span className="font-medium text-slate-700">{commission.presidentId.slice(0, 8)}</span>
        </div>
        <Link
          href={`/${locale}/dashboard/commission/evaluations/${commission.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#43A047]"
        >
          {isAr ? "فتح" : "Ouvrir"}
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export default function CommissionEvaluationsPage({ locale }: Props) {
  const isAr = locale === "ar";

  const { data, isLoading } = useCommissionsEvaluationQuery({ page: 1, limit: 100 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatutView | "ALL">("ALL");

  const commissions = useMemo(() => data?.data ?? [], [data]);
  const sortedCommissions = useMemo(
    () =>
      [...commissions].sort((a, b) => {
        const bDate = new Date(b.createdAt || b.dateCreation).getTime();
        const aDate = new Date(a.createdAt || a.dateCreation).getTime();
        return bDate - aDate;
      }),
    [commissions]
  );

  const filtered = sortedCommissions.filter((commission) => {
    const haystack = `${commission.reference} ${commission.objet} ${commission.statut}`.toLowerCase();
    const matchSearch = haystack.includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || commission.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: commissions.length,
    active: commissions.filter((commission) => commission.statut === "ACTIVE").length,
    cloturee: commissions.filter((commission) => commission.statut === "CLOTUREE").length,
    brouillon: commissions.filter((commission) => commission.statut === "BROUILLON").length,
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-56 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="flex flex-col gap-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {isAr ? "لجان التقييم" : "Commissions d'évaluation"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {isAr ? "قائمة اللجان" : "Liste des commissions"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {isAr
              ? "جميع اللجان القادمة من الخادم تظهر هنا مباشرة."
              : "Toutes les commissions renvoyées par le backend s'affichent ici directement."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500">{isAr ? "المجموع" : "Total"}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <div className="text-2xl font-bold text-emerald-700">{stats.active}</div>
            <div className="text-xs text-emerald-700">{isAr ? "نشطة" : "Actives"}</div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <div className="text-2xl font-bold text-slate-700">{stats.cloturee}</div>
            <div className="text-xs text-slate-700">{isAr ? "مغلقة" : "Clôturées"}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث بالمرجع أو الموضوع" : "Rechercher par référence ou objet"}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ALL", "ACTIVE", "BROUILLON", "CLOTUREE", "ANNULEE"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                statusFilter === status
                  ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {status === "ALL" ? (isAr ? "الكل" : "Tous") : statusLabel(status, isAr)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState isAr={isAr} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((commission) => (
            <CommissionCard key={commission.id} locale={locale} commission={commission} />
          ))}
        </div>
      )}
    </div>
  );
}
