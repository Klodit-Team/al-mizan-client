"use client";
import { useState } from "react";
import Link from "next/link";
import StatutBadge from "./StatutBadge";
import type { CommissionDict, MembreCommission, CommissionStatut } from "./types";
import { useMesCommissionsQuery } from "@/services/commission-dashboard/queries";
import type { CommissionEvaluation, CommissionMarche } from "@/services/commission-dashboard/api";

type CommissionListItem = MembreCommission & {
  kind: "evaluation" | "marche";
};

function getRoleLabel(role: string, dict: CommissionDict) {
  const roleKeyMap: Record<string, string> = {
    "Président": "president",
    "Évaluateur": "evaluateur",
    "Rapporteur": "rapporteur",
    "Membre": "membre",
    "Observateur": "observateur",
  };

  const roleKey = roleKeyMap[role];
  return dict.roles?.[roleKey ?? "membre"] ?? role;
}

// ── Mapping statut backend → statut UI ──────────────────────────────────────
function mapStatutEval(statut: string): CommissionStatut {
  switch (statut) {
    case "ACTIVE": return "ACTIVE";
    case "CLOTUREE":
    case "ANNULEE": return "DISSOUTE";
    default: return "CONSTITUEE";
  }
}

function mapRoleEval(role: string): string {
  switch (role) {
    case "PRESIDENT": return "Président";
    case "RAPPORTEUR": return "Rapporteur";
    case "OBSERVATEUR": return "Observateur";
    default: return "Évaluateur";
  }
}

function transformEvaluationToCommission(ce: CommissionEvaluation, aoId?: string): CommissionListItem {
  return {
    id: ce.id,
    designation: ce.objet,
    appelOffre: { id: aoId ?? ce.id, reference: ce.reference, objet: ce.objet },
    monRole: mapRoleEval(ce.membres?.[0]?.role ?? "MEMBRE") as MembreCommission["monRole"],
    dateConstitution: ce.dateCreation,
    statut: mapStatutEval(ce.statut),
    kind: "evaluation",
  };
}

function mapStatutMarche(statut: string): CommissionStatut {
  switch (statut) {
    case "ATTRIBUEE":
      return "DISSOUTE";
    case "ANNULEE":
    case "INFRUCTUEUSE":
      return "DISSOUTE";
    default:
      return "ACTIVE";
  }
}

function transformMarcheToCommission(cm: CommissionMarche): CommissionListItem {
  return {
    id: cm.id,
    designation: cm.intitule,
    appelOffre: { id: cm.id, reference: cm.reference, objet: cm.intitule },
    monRole: "Membre",
    dateConstitution: cm.dateCreation,
    statut: mapStatutMarche(cm.statut),
    kind: "marche",
  };
}

const STATUTS: { label: string; value: CommissionStatut | "ALL" }[] = [
  { label: "Tous les statuts", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Constituée", value: "CONSTITUEE" },
  { label: "Dissoute", value: "DISSOUTE" },
];

interface MesCommissionsPageProps {
  locale: string;
  dict: CommissionDict;
  userId?: string;
}

export default function MesCommissionsPage({ locale, dict, userId }: MesCommissionsPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommissionStatut | "ALL">("ALL");

  const { data, isLoading } = useMesCommissionsQuery(userId);
  const aoIdByCommissionId = new Map(
    (data?.seancesOuverture ?? []).map((seance) => [seance.commissionId, seance.appelOffreId])
  );

  const evaluationCommissions: CommissionListItem[] =
    (data?.commissionsEvaluation ?? []).map((commission) =>
      transformEvaluationToCommission(commission, aoIdByCommissionId.get(commission.id))
    );

  const marcheCommissions: CommissionListItem[] =
    (data?.commissionsMarche ?? []).map((commission) =>
      transformMarcheToCommission(commission)
    );

  const commissions = [...evaluationCommissions, ...marcheCommissions];

  const filtered = commissions.filter((c) => {
    const matchSearch =
      c.designation.toLowerCase().includes(search.toLowerCase()) ||
      c.appelOffre.reference.toLowerCase().includes(search.toLowerCase()) ||
      c.appelOffre.objet.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: commissions.length,
    active: commissions.filter((c) => c.statut === "ACTIVE").length,
    constituee: commissions.filter((c) => c.statut === "CONSTITUEE").length,
    dissoute: commissions.filter((c) => c.statut === "DISSOUTE").length,
  };

  const typeLabels = {
    evaluation: locale === "ar" ? "تقييم" : "Évaluation",
    marche: locale === "ar" ? "سوق" : "Marché",
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
        </div>
        {!isLoading && commissions.length > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-semibold text-gray-700">{stats.total}</span>{" "}
            {stats.total !== 1 ? dict.stats.totalPlural : dict.stats.total}
          </span>
        )}
      </div>

      {/* Stats Row — masqué si aucune donnée */}
      {!isLoading && commissions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: dict.stats.active, count: stats.active, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: dict.stats.constituee, count: stats.constituee, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: dict.stats.dissoute, count: stats.dissoute, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}>
              <span className={`text-2xl font-bold ${s.color}`}>{s.count}</span>
              <span className="text-sm font-medium text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar — masqué si vide */}
      {!isLoading && commissions.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={dict.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white text-gray-700 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {STATUTS.map((s) => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === s.value
                    ? "bg-[#4CAF50] text-white border-[#4CAF50] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                }`}>
                {s.value === "ALL" ? dict.filters.all : dict.filters[s.value]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {!isLoading && commissions.length > 0 && (
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {[dict.columns.designation, dict.columns.appelOffre, dict.columns.monRole, dict.columns.dateConstitution, dict.columns.statut, dict.columns.actions].map((col) => (
                    <th key={col} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${60 + (j * 10) % 30}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">
                        {search || statusFilter !== "ALL" ? dict.noResults ?? "Aucun résultat" : dict.noCommissions}
                      </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {search || statusFilter !== "ALL"
                            ? dict.noResultsSub ?? "Essayez d'autres critères de recherche"
                            : dict.noCommissionsSub ?? "Aucune commission ne vous a encore été assignée"}
                        </p>
                      </div>
                      {(search || statusFilter !== "ALL") && (
                        <button onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                          className="text-xs text-emerald-600 hover:underline mt-1">
                          {dict.resetFilters}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((commission) => {
                  const typeLabel = commission.kind === "marche" ? typeLabels.marche : typeLabels.evaluation;
                  return (
                    <tr key={commission.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                              {commission.designation}
                            </p>
                            <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              {typeLabel}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-700">{commission.appelOffre.reference}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{commission.appelOffre.objet}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {getRoleLabel(commission.monRole, dict)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(commission.dateConstitution).toLocaleDateString(
                          locale === "ar" ? "ar-DZ" : "fr-DZ",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatutBadge statut={commission.statut} dict={dict.statuts ?? {}} />
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/${locale}/dashboard/commission/details/${commission.id}`}
                          title={dict.actions}
                          className="inline-flex items-center gap-2 rounded-full bg-[#4CAF50] px-4 py-2 text-white text-sm font-semibold shadow-sm shadow-emerald-200 hover:bg-[#43A047] transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l7 7-7 7" />
                          </svg>
                          {locale === "ar" ? "عرض التفاصيل" : "Voir détails"}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              {filtered.length} {filtered.length !== 1 ? dict.resultsCountPlural : dict.resultsCount}
              {statusFilter !== "ALL" || search ? ` ${dict.filtered}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
