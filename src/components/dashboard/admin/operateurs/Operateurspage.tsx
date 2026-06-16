"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
  blacklistAdminOperateur,
  unblacklistAdminOperateur,
  type OperateurEconomiqueEntity,
} from "@/services/admin/operateurs";
import { useOperateursQuery } from "@/services/admin/operateurs/queries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface OperateursPageProps {
  locale: string;
  dict: CommonDict['dashboard']['admin']['operateursPage'];
}

export default function OperateursPage({ locale, dict }: OperateursPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");

  const { data: response, isLoading, refetch } = useOperateursQuery(page, limit);
  const operateurs = response?.data ?? [];
  const meta = response?.meta;

  const [blacklistModal, setBlacklistModal] = useState<{
    isOpen: boolean;
    user: OperateurEconomiqueEntity | null;
    motif: string;
  }>({ isOpen: false, user: null, motif: "" });

  const handleBlacklistSubmit = async () => {
    if (!blacklistModal.user) return;
    try {
      await blacklistAdminOperateur(blacklistModal.user.id, blacklistModal.motif);
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setBlacklistModal({ isOpen: false, user: null, motif: "" });
    }
  };

  const handleRemoveBlacklist = async (userId: string) => {
    try {
      await unblacklistAdminOperateur(userId);
      refetch();
    } catch (error) {
      console.error("Error removing blacklist:", error);
    }
  };

  const filtered = operateurs.filter((op) =>
    (op.userId && op.userId.toLowerCase().includes(search.toLowerCase())) ||
    (op.organisationId && op.organisationId.toLowerCase().includes(search.toLowerCase())) ||
    (op.id && op.id.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = operateurs.filter((u) => u.isEligible && !u.isBlacklisted).length;
  const blacklistedCount = operateurs.filter((u) => u.isBlacklisted).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
            <p className="text-xs text-gray-400">{dict.activeCount}</p>
            <p className="text-lg font-bold text-green-500">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
            <p className="text-xs text-gray-400">{dict.blacklistedCount}</p>
            <p className="text-lg font-bold text-red-500">{blacklistedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Rechercher par ID (Opérateur, User, Org)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">{dict.listTitle} ({filtered.length})</h2>
          {isLoading && <span className="text-xs text-gray-400 animate-pulse">Chargement…</span>}
        </div>
        {filtered.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <p className="text-sm">{dict.noOperators}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Opérateur (ID)
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Qualifications
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Éligible
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {dict.columns.status}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {dict.columns.createdAt}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {dict.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                      <td className="px-5 py-4"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                      <td className="px-5 py-4"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 w-24 bg-gray-100 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700 font-mono truncate max-w-[12rem]" title={user.id}>
                          {user.id}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[12rem]" title={user.userId}>
                          User: {user.userId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {user.qualifications ? (
                        <div className="flex flex-wrap gap-1">
                          {user.qualifications.split(",").slice(0, 2).map((q, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                              {q.trim()}
                            </span>
                          ))}
                          {user.qualifications.split(",").length > 2 && (
                            <span className="text-[10px] text-gray-400">+{user.qualifications.split(",").length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Aucune</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {user.isEligible ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Oui</span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">Non</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          user.isBlacklisted ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                        }`}
                        title={user.isBlacklisted ? user.raisonBlacklist : undefined}
                      >
                        {user.isBlacklisted ? dict.statusLabels.blacklisted : dict.statusLabels.active}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ') : 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/${locale}/dashboard/admin/operateurs/${user.id}`)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          title="Voir les détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {!user.isBlacklisted ? (
                          <button
                            onClick={() => setBlacklistModal({ isOpen: true, user, motif: "" })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                          >
                            {dict.actionsLabels.blacklist}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveBlacklist(user.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200"
                          >
                            {dict.actionsLabels.unblacklist}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Blacklist */}
      {blacklistModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{dict.modal.title}</h3>
              <button onClick={() => setBlacklistModal({ isOpen: false, user: null, motif: "" })} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                {dict.modal.warning1} <strong>{blacklistModal.user?.id}</strong>.
                {dict.modal.warning2}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.motifLabel}</label>
                <textarea
                  value={blacklistModal.motif}
                  onChange={(e) => setBlacklistModal({ ...blacklistModal, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 text-sm bg-white text-gray-900"
                  rows={4}
                  placeholder={dict.modal.motifPlaceholder}
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setBlacklistModal({ isOpen: false, user: null, motif: "" })}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {dict.modal.cancel}
              </button>
              <button
                onClick={handleBlacklistSubmit}
                disabled={!blacklistModal.motif.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dict.modal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
