"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  Commission,
  CommissionFormData,
  CommissionNiveau,
  CommissionStatut,
  CommissionType,
} from "./types";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
  updateAdminCommission,
  type CreateCommissionInput,
} from "@/services/admin/commissions/api";
import {
  useCommissionsQuery,
  useCreateCommissionMutation,
  useUpdateCommissionStatusMutation,
  useUpdateCommissionMutation,
  useDeleteCommissionMutation,
} from "@/services/admin";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface CommissionsPageProps {
  locale: string;
  dict: CommonDict["dashboard"]["admin"]["commissionsPage"];
}

const emptyForm: CommissionFormData = {
  designation: "",
  type: "EVALUATION",
  niveau: "NATIONALE",
  appel_offre_id: "",
};

const statusOptions: CommissionStatut[] = ["CONSTITUEE", "ACTIVE", "DISSOUTE"];

const FALLBACK_COMMISSION: Commission = {
  id: "fallback-commission-1",
  designation: "Commission Nationale d'Évaluation des Marchés",
  type: "MARCHE",
  niveau: "NATIONALE",
  statut: "ACTIVE",
  date_constitution: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  appel_offre_id: "AO-2024-001",
};

// Helper to map backend DTO (CommissionMarche) to UI model (Commission)
const mapToCommission = (data: any): Commission => {
  // Map all 5 backend statuses to the 3 UI statuses
  let uiStatut: CommissionStatut = "CONSTITUEE";
  if (data.statut === "EN_COURS" || data.statut === "DELIBERATION") uiStatut = "ACTIVE";
  else if (data.statut === "ANNULEE" || data.statut === "INFRUCTUEUSE") uiStatut = "DISSOUTE";
  // ATTRIBUEE → CONSTITUEE (default)

  return {
    id: data.id || `temp-${Math.random()}`,
    designation: data.intitule || data.reference || data.designation || "Sans titre",
    type: (data.typeMarche ? "MARCHE" : data.type) || "EVALUATION",
    niveau: data.niveau || "NATIONALE",
    statut: uiStatut,
    date_constitution: data.createdAt || data.date_constitution || new Date().toISOString(),
    created_at: data.createdAt || data.created_at || new Date().toISOString(),
    appel_offre_id: data.reference || data.appel_offre_id || undefined,
  };
};

export default function CommissionsPage({ locale, dict }: CommissionsPageProps) {
  const router = useRouter();
  const labels = useMemo(() => {
    const extra = dict as typeof dict & {
      columns?: { actions?: string };
      modal?: { editTitle?: string; save?: string };
      actions?: { edit?: string; delete?: string; deleting?: string };
      loading?: string;
      error?: string;
    };

    return {
      actionsColumn: extra.columns?.actions ?? "Actions",
      editTitle: extra.modal?.editTitle ?? "Modifier la commission",
      save: extra.modal?.save ?? "Enregistrer",
      viewDetails: (extra.actions as any)?.viewDetails ?? "Détails",
      edit: extra.actions?.edit ?? "Modifier",
      delete: extra.actions?.delete ?? "Supprimer",
      deleting: extra.actions?.deleting ?? "Suppression...",
      loading: extra.loading ?? "Chargement des commissions...",
      error: extra.error ?? "Impossible de charger les commissions.",
    };
  }, [dict]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState<CommissionFormData>(emptyForm);

  const { data: response, isLoading, isError } = useCommissionsQuery();
  const { mutateAsync: createMutate } = useCreateCommissionMutation();
  const { mutateAsync: updateMutate } = useUpdateCommissionMutation();
  const { mutateAsync: updateStatusMutate } = useUpdateCommissionStatusMutation();
  const { mutateAsync: deleteMutate } = useDeleteCommissionMutation();

  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    if (response) {
      const data = Array.isArray(response) ? response : response?.data || [];
      setCommissions(data.length > 0 ? data.map(mapToCommission) : [FALLBACK_COMMISSION]);
    } else if (isError) {
      setCommissions([FALLBACK_COMMISSION]);
    }
  }, [response, isError]);

  const openCreateModal = () => {
    setEditingCommission(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      designation: commission.designation,
      type: commission.type,
      niveau: commission.niveau,
      appel_offre_id: commission.appel_offre_id ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (isSubmitting && !force) return;
    setModalOpen(false);
    setEditingCommission(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Map form data to backend CreateCommissionInput (CommissionMarcheDto)
    // TODO: replace presidentId with the actual logged-in admin's userId once
    // an auth context hook is available (e.g. useAuth().user.id).
    const payload = {
      intitule: formData.designation,
      typeMarche: formData.type === "EVALUATION" ? "SERVICES" : "TRAVAUX",
      presidentId: "00000000-0000-0000-0000-000000000000",
      statut: "EN_COURS",
    } as unknown as CreateCommissionInput;

    setIsSubmitting(true);
    try {
      if (editingCommission) {
        const updated = await updateMutate({ id: editingCommission.id, payload });
        const mapped = mapToCommission(updated);
        setCommissions((current) =>
          current.map((commission) =>
            commission.id === mapped.id ? mapped : commission,
          ),
        );
      } else {
        const created = await createMutate(payload);
        const mapped = mapToCommission(created);
        setCommissions((current) => [mapped, ...current]);
      }

      closeModal(true);
    } catch (err) {
      console.error("Error saving commission:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (commission: Commission, statut: CommissionStatut) => {
    const previous = commissions;

    setCommissions((current) =>
      current.map((item) =>
        item.id === commission.id ? { ...item, statut } : item,
      ),
    );

    try {
      // Map UI status back to the most representative backend CommissionStatut
      const backendStatut =
        statut === "ACTIVE"    ? "EN_COURS"  :
        statut === "DISSOUTE"  ? "ANNULEE"   :
        /* CONSTITUEE */         "ATTRIBUEE";
      const updated = await updateStatusMutate({ id: commission.id, status: backendStatut as any });
      const mapped = mapToCommission(updated);
      setCommissions((current) =>
        current.map((item) => (item.id === mapped.id ? mapped : item)),
      );
    } catch (err) {
      console.error("Error changing commission status:", err);
      setCommissions(previous);
    }
  };

  const handleDelete = async (commission: Commission) => {
    const confirmed = window.confirm(`${labels.delete} "${commission.designation}" ?`);
    if (!confirmed) return;

    const previous = commissions;
    setDeletingId(commission.id);
    setCommissions((current) => current.filter((item) => item.id !== commission.id));

    try {
      await deleteMutate(commission.id);
    } catch (err) {
      console.error("Error deleting commission:", err);
      setCommissions(previous);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = commissions.filter((commission) =>
    commission.designation.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {dict.createButton}
        </button>
      </div>

      <div className="relative max-w-sm">
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
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
        />
      </div>

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {labels.error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.designation}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.type}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.niveau}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.statut}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.date}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{labels.actionsColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    {labels.loading}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    {dict.noCommissions}
                  </td>
                </tr>
              ) : (
                filtered.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">{commission.designation}</p>
                      {commission.appel_offre_id && (
                        <p className="text-xs text-gray-400 mt-0.5">AO: {commission.appel_offre_id}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {dict.enums.type[commission.type]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {dict.enums.niveau[commission.niveau]}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={commission.statut}
                        onChange={(e) => handleStatusChange(commission, e.target.value as CommissionStatut)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#4CAF50]"
                      >
                        {statusOptions.map((statut) => (
                          <option key={statut} value={statut}>
                            {dict.enums.statut[statut]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(commission.date_constitution).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/${locale}/dashboard/admin/commissions/${commission.id}`)}
                          title={labels.viewDetails}
                          className="p-1.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#4CAF50] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(commission)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {labels.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(commission)}
                          disabled={deletingId === commission.id}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {deletingId === commission.id ? labels.deleting : labels.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCommission ? labels.editTitle : dict.modal.title}
              </h3>
              <button type="button" onClick={() => closeModal()} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.modal.designationLabel}</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-sm text-gray-800"
                  placeholder={dict.modal.designationPlaceholder}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.modal.typeLabel}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CommissionType })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-sm text-gray-800 bg-white"
                  >
                    <option value="EVALUATION">{dict.enums.type.EVALUATION}</option>
                    <option value="MARCHE">{dict.enums.type.MARCHE}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.modal.niveauLabel}</label>
                  <select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value as CommissionNiveau })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-sm text-gray-800 bg-white"
                  >
                    <option value="NATIONALE">{dict.enums.niveau.NATIONALE}</option>
                    <option value="SECTORIELLE">{dict.enums.niveau.SECTORIELLE}</option>
                    <option value="WILAYA">{dict.enums.niveau.WILAYA}</option>
                    <option value="COMMUNALE">{dict.enums.niveau.COMMUNALE}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.modal.appelOffreLabel}</label>
                <input
                  type="text"
                  value={formData.appel_offre_id}
                  onChange={(e) => setFormData({ ...formData, appel_offre_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-sm text-gray-800"
                  placeholder={dict.modal.appelOffrePlaceholder}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => closeModal()}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
              >
                {dict.modal.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#4CAF50] rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-60"
              >
                {editingCommission ? labels.save : dict.modal.create}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
