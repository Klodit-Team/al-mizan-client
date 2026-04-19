"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  Scale, Eye, Plus, Search, ChevronLeft, ChevronRight,
  Clock, AlertTriangle, FileCheck, XCircle, Hourglass,
} from "lucide-react";
import { useOperateurRecoursQuery } from "@/services/operateur-recours/queries";
import {
  STATUS_META, fmt, isDeadlineUrgent, isDeadlinePast,
  type RecoursStatus,
} from "./types";

const FILTERS: Array<{ value: RecoursStatus | "all"; label: string }> = [
  { value: "all",       label: "Tous" },
  { value: "depose",    label: "Déposé" },
  { value: "en_examen", label: "En examen" },
  { value: "accepte",   label: "Accepté" },
  { value: "rejete",    label: "Rejeté" },
];

const ITEMS_PER_PAGE = 8;

function StatCard({ label, value, icon, colorClass, bgClass }: {
  label: string; value: number; icon: React.ReactNode; colorClass: string; bgClass: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function DeadlineBadge({ dateLimite, statut }: { dateLimite: string; statut: RecoursStatus }) {
  if (statut === "accepte" || statut === "rejete") {
    return <span className="text-xs text-slate-400">{fmt(dateLimite)}</span>;
  }
  const past   = isDeadlinePast(dateLimite);
  const urgent = isDeadlineUrgent(dateLimite);
  if (past) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
        <AlertTriangle className="h-3 w-3" /> Dépassé
      </span>
    );
  }
  if (urgent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        <Clock className="h-3 w-3" /> {fmt(dateLimite)}
      </span>
    );
  }
  return <span className="text-xs text-slate-600">{fmt(dateLimite)}</span>;
}

export default function MesRecoursPage() {
    const { data = [], isLoading, isError } = useOperateurRecoursQuery();

  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [keyword, setKeyword]     = useState("");
  const [statusFilter, setStatus] = useState<RecoursStatus | "all">("all");
  const [page, setPage]           = useState(1);

  const filtered = useMemo(() => data.filter((r) => {
    if (statusFilter !== "all" && r.statut !== statusFilter) return false;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      if (
        !r.reference.toLowerCase().includes(kw) &&
        !r.aoReference.toLowerCase().includes(kw) &&
        !r.aoObject.toLowerCase().includes(kw)
      ) return false;
    }
    return true;
  }), [data, keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = useMemo(() => ({
    total: data.length,
    enExamen: data.filter((r) => r.statut === "en_examen").length,
    acceptes: data.filter((r) => r.statut === "accepte").length,
    rejetes: data.filter((r) => r.statut === "rejete").length,
  }), [data]);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mes Recours</h1>
          <p className="mt-0.5 text-sm text-slate-500">Suivi de vos procédures de contestation</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/recours/deposer`)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Plus className="h-4 w-4" />
          Déposer un recours
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total recours" value={counts.total}    icon={<Scale className="h-5 w-5" />}      colorClass="text-slate-700"    bgClass="bg-slate-100" />
        <StatCard label="En examen"     value={counts.enExamen} icon={<Hourglass className="h-5 w-5" />}  colorClass="text-orange-600"   bgClass="bg-orange-100" />
        <StatCard label="Acceptés"      value={counts.acceptes} icon={<FileCheck className="h-5 w-5" />}  colorClass="text-emerald-600"  bgClass="bg-emerald-100" />
        <StatCard label="Rejetés"       value={counts.rejetes}  icon={<XCircle className="h-5 w-5" />}    colorClass="text-rose-600"     bgClass="bg-rose-100" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Référence, AO, objet…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
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
        <div className="hidden sm:grid sm:grid-cols-[150px_1fr_130px_160px_110px_48px] border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          {["Référence recours", "AO / Objet", "Date dépôt", "Date limite réponse", "Statut", ""].map((h) => (
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
            <Scale className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">Aucun recours trouvé</p>
            <p className="mt-1 text-xs">Modifiez vos filtres ou déposez un nouveau recours</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {paginated.map((rec) => {
              const meta = STATUS_META[rec.statut];
              return (
                <li
                  key={rec.id}
                  className="grid grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:grid-cols-[150px_1fr_130px_160px_110px_48px] sm:items-center"
                >
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-700">{rec.reference}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-semibold" style={{ color: "#4CAF50" }}>{rec.aoReference}</span>
                    <p className="truncate text-xs font-medium text-slate-800">{rec.aoObject}</p>
                  </div>
                  <div className="text-xs text-slate-500">{fmt(rec.dateDepot)}</div>
                  <div>
                    <DeadlineBadge dateLimite={rec.dateLimiteReponse} statut={rec.statut} />
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      title="Voir le détail"
                      onClick={() => router.push(`/${locale}/dashboard/operateur/recours/${rec.id}`)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-[#4CAF50] hover:bg-emerald-50 hover:text-[#4CAF50]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          Impossible de charger les recours. Vérifiez la disponibilité de la passerelle API et du recours-service.
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