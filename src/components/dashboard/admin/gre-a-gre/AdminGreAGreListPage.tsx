"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type AdminGreAGreDemand,
  type AdminGreAGreStatus,
  useAdminGreAGreDemandsQuery,
} from "@/services/admin/gre-a-gre";

const STATUS_OPTIONS: AdminGreAGreStatus[] = [
  "SOUMISE",
  "EN_ANALYSE_IA",
  "ACCEPTEE",
  "REJETEE",
  "EN_REVISION",
  "BROUILLON",
];

const statusLabel: Record<AdminGreAGreStatus, string> = {
  BROUILLON: "Brouillon",
  SOUMISE: "Soumise",
  EN_ANALYSE_IA: "Analyse IA",
  ACCEPTEE: "Acceptee",
  REJETEE: "Refusee",
  EN_REVISION: "En revision",
};

function statusClass(status: AdminGreAGreStatus) {
  switch (status) {
    case "ACCEPTEE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJETEE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "EN_ANALYSE_IA":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "SOUMISE":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function controlRailClass(demand: AdminGreAGreDemand) {
  const recommendation = demand.evaluationsIa?.[0]?.recommandation;
  const decision = demand.decisions?.[0]?.decisionFinale;
  if (decision === "ACCEPTER") return "bg-emerald-500";
  if (decision === "REJETER") return "bg-rose-500";
  if (recommendation === "REJETER") return "bg-amber-500";
  return "bg-slate-300";
}

function formatAmount(value: number | string | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return String(value ?? "-");
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDemandAo(demand: AdminGreAGreDemand) {
  return demand.appelOffres ?? demand.appelOffre ?? demand.appel_offres ?? demand.ao;
}

export default function AdminGreAGreListPage({ locale }: { locale: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminGreAGreStatus | "">("");

  const { data, isLoading, isError } = useAdminGreAGreDemandsQuery({
    page: 1,
    limit: 50,
    statut: status || undefined,
  });

  const demands = data?.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return demands;
    return demands.filter((demand) => {
      const ao = getDemandAo(demand);
      return [
        demand.id,
        demand.aoId,
        demand.serviceContractantId,
        ao?.reference,
        ao?.objet,
        ao?.wilaya,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [demands, search]);

  const pendingCount = demands.filter((d) => d.statut === "SOUMISE" || d.statut === "EN_ANALYSE_IA").length;
  const aiRefusalCount = demands.filter((d) => d.evaluationsIa?.[0]?.recommandation === "REJETER").length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Controle GRE</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Demandes gre a gre</h1>
          <p className="mt-1 text-sm text-slate-500">
            Controle administratif des demandes, recommandations IA et decisions finales.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">A traiter</p>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
          </div>
          <div className="border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-700">Refus IA</p>
            <p className="text-2xl font-bold text-amber-900">{aiRefusalCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Reference, objet, demande, service contractant..."
          className="min-w-[280px] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as AdminGreAGreStatus | "")}
          className="min-w-[190px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {statusLabel[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-2 px-0 py-4" />
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Objet</th>
                <th className="px-5 py-4">IA</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">Chargement...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-rose-500">Impossible de charger les demandes.</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">Aucune demande trouvee.</td>
                </tr>
              ) : (
                filtered.map((demand) => {
                  const ao = getDemandAo(demand);
                  const ia = demand.evaluationsIa?.[0];
                  return (
                    <tr key={demand.id} className="hover:bg-slate-50">
                      <td className="px-0 py-4">
                        <div className={`h-12 w-1.5 ${controlRailClass(demand)}`} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{ao?.reference ?? demand.aoId}</div>
                        <div className="mt-0.5 font-mono text-xs text-slate-400">{demand.id}</div>
                      </td>
                      <td className="max-w-[360px] px-5 py-4">
                        <div className="truncate font-medium text-slate-800">{ao?.objet ?? "-"}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{formatAmount(ao?.montantEstime)}</div>
                      </td>
                      <td className="px-5 py-4">
                        {ia ? (
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-slate-800">{ia.recommandation.replace(/_/g, " ")}</div>
                            <div className="text-xs text-slate-500">
                              Score {Number(ia.scoreConformite).toFixed(0)} / 100
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">En attente</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex border px-2 py-1 text-xs font-semibold ${statusClass(demand.statut)}`}>
                          {statusLabel[demand.statut]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(demand.createdAt).toLocaleDateString(locale)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => router.push(`/${locale}/dashboard/admin/gre-a-gre/${demand.id}`)}
                          className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Controler
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
