"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
    getAdminIncidents,
    resolveAdminIncident,
    updateAdminIncidentStatut,
    type AIIncident,
    type IncidentStatut,
    type IncidentGravite,
} from "@/services/admin/incidents";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const defaultIncidents: AIIncident[] = [
    {
        id: "INC-2024-001",
        type_incident: "DIVERGENCE_GRE_A_GRE",
        entite_source: "appel-offres-service",
        entite_id: "AO-LOT-3",
        modele_ia: "gpt-4o",
        decision_ia: "ACCEPTER",
        decision_humaine: "REJETER",
        ecart_score: 0.40,
        confiance_ia: 0.85,
        gravite: "CRITIQUE",
        statut: "OUVERT",
        date_detection: "2024-03-10T10:30:00Z",
        created_at: "2024-03-10T10:30:00Z",
    },
    {
        id: "INC-2024-002",
        type_incident: "DIVERGENCE_EVALUATION",
        entite_source: "evaluation-service",
        entite_id: "EVAL-OP-X",
        modele_ia: "gpt-4o",
        decision_ia: "ACCEPTER",
        decision_humaine: "EN_ATTENTE",
        ecart_score: 0.15,
        confiance_ia: 0.72,
        gravite: "MOYENNE",
        statut: "EN_ANALYSE",
        date_detection: "2024-03-11T14:15:00Z",
        created_at: "2024-03-11T14:15:00Z",
    },
    {
        id: "INC-2024-003",
        type_incident: "CONFIANCE_FAIBLE",
        entite_source: "soumission-service",
        entite_id: "SOM-2024-007",
        modele_ia: "gpt-4o",
        decision_ia: "INDETERMINATE",
        decision_humaine: "",
        ecart_score: 0.05,
        confiance_ia: 0.38,
        gravite: "FAIBLE",
        statut: "OUVERT",
        date_detection: "2024-03-09T09:00:00Z",
        created_at: "2024-03-09T09:00:00Z",
    },
];

interface IncidentsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['incidentsPage'];
}

export default function IncidentsPage({ locale, dict }: IncidentsPageProps) {
    const [incidents, setIncidents] = useState<AIIncident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<IncidentStatut | "">("");
    const [graviteFilter, setGraviteFilter] = useState<IncidentGravite | "">("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<AIIncident | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [newStatus, setNewStatus] = useState<IncidentStatut>("EN_ANALYSE");
    const [isSaving, setIsSaving] = useState(false);

    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminIncidents({
                statut:  statusFilter  || undefined,
                gravite: graviteFilter || undefined,
                limit: 100,
            });
            setIncidents(Array.isArray(data) ? data : defaultIncidents);
        } catch (error) {
            console.error("Error fetching incidents:", error);
            setIncidents(defaultIncidents);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, graviteFilter]);

    // Client-side text search
    const filteredIncidents = useMemo(() => {
        if (!search) return incidents;
        const q = search.toLowerCase();
        return incidents.filter((inc) =>
            inc.id.toLowerCase().includes(q) ||
            inc.type_incident.toLowerCase().includes(q) ||
            inc.entite_source.toLowerCase().includes(q) ||
            inc.entite_id.toLowerCase().includes(q)
        );
    }, [incidents, search]);

    const getGraviteStyles = (gravite: IncidentGravite) => {
        switch (gravite) {
            case "CRITIQUE": return "bg-red-50 text-red-700 border-red-200";
            case "ELEVEE":   return "bg-orange-50 text-orange-700 border-orange-200";
            case "MOYENNE":  return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "FAIBLE":   return "bg-blue-50 text-blue-700 border-blue-200";
            default:         return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusStyles = (statut: IncidentStatut) => {
        switch (statut) {
            case "OUVERT":      return "bg-red-100 text-red-800";
            case "EN_ANALYSE":  return "bg-yellow-100 text-yellow-800";
            case "RESOLU":      return "bg-green-100 text-green-800";
            case "IGNORE":      return "bg-gray-100 text-gray-600";
            default:            return "bg-gray-100 text-gray-800";
        }
    };

    const openModal = (incident: AIIncident) => {
        setSelectedIncident(incident);
        setResolutionNotes(incident.resolution_notes ?? "");
        setNewStatus(incident.statut === "RESOLU" ? "RESOLU" : "EN_ANALYSE");
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedIncident) return;
        setIsSaving(true);

        try {
            if (newStatus === "RESOLU") {
                // Use the resolve endpoint (requires notes)
                await resolveAdminIncident(selectedIncident.id, {
                    resolution_notes: resolutionNotes,
                });
            } else {
                // Use the statut endpoint for other transitions
                await updateAdminIncidentStatut(selectedIncident.id, newStatus);
            }

            // Optimistic update
            setIncidents((prev) =>
                prev.map((inc) =>
                    inc.id === selectedIncident.id
                        ? { ...inc, statut: newStatus, resolution_notes: resolutionNotes }
                        : inc
                )
            );
        } catch (error) {
            console.error("Error updating incident:", error);
        } finally {
            setIsSaving(false);
            setIsModalOpen(false);
            setSelectedIncident(null);
        }
    };

    const STATUT_OPTIONS: IncidentStatut[] = ["OUVERT", "EN_ANALYSE", "RESOLU", "IGNORE"];
    const GRAVITE_OPTIONS: IncidentGravite[] = ["FAIBLE", "MOYENNE", "ELEVEE", "CRITIQUE"];

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                {/* Text search */}
                <div className="flex-1 min-w-[250px] relative">
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
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50]"
                    />
                </div>

                {/* Status filter */}
                <div className="flex-1 min-w-[180px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as IncidentStatut | "")}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                    >
                        <option value="">{dict.statusFilterPlaceholder}</option>
                        {STATUT_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {dict.status[s as keyof typeof dict.status] ?? s}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Gravité filter */}
                <div className="flex-1 min-w-[180px]">
                    <select
                        value={graviteFilter}
                        onChange={(e) => setGraviteFilter(e.target.value as IncidentGravite | "")}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                    >
                        <option value="">Toutes les gravités</option>
                        {GRAVITE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                                {dict.severity[g as keyof typeof dict.severity] ?? g}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">{dict.columns.id}</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">{dict.columns.severity}</th>
                                <th className="px-6 py-4">Écart IA</th>
                                <th className="px-6 py-4">{dict.columns.date}</th>
                                <th className="px-6 py-4">{dict.columns.status}</th>
                                <th className="px-6 py-4">{dict.columns.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Aucun incident trouvé.</td></tr>
                            ) : (
                                filteredIncidents.map((inc) => (
                                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{inc.id}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-gray-700">{inc.type_incident.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium">{inc.entite_source}</div>
                                            <div className="text-xs text-gray-400 font-mono">{inc.entite_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getGraviteStyles(inc.gravite)}`}>
                                                {dict.severity[inc.gravite as keyof typeof dict.severity] ?? inc.gravite}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <span className="text-gray-500">IA: </span><span className="font-medium">{inc.decision_ia}</span>
                                            </div>
                                            <div className="text-xs">
                                                <span className="text-gray-500">Humain: </span><span className="font-medium">{inc.decision_humaine || '—'}</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Écart: {(inc.ecart_score * 100).toFixed(0)}% · Conf: {(inc.confiance_ia * 100).toFixed(0)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {new Date(inc.date_detection).toLocaleString(locale)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(inc.statut)}`}>
                                                {dict.status[inc.statut as keyof typeof dict.status] ?? inc.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openModal(inc)}
                                                disabled={inc.statut === "RESOLU" || inc.statut === "IGNORE"}
                                                className="text-[#4CAF50] hover:text-green-700 font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Voir / Traiter
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resolve / Update modal */}
            {isModalOpen && selectedIncident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{dict.modal.title}</h2>
                        <p className="text-xs text-gray-400 mb-4 font-mono">{selectedIncident.id}</p>

                        {/* Incident summary */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs space-y-1 text-gray-600">
                            <div><span className="font-medium">Type:</span> {selectedIncident.type_incident}</div>
                            <div><span className="font-medium">Source:</span> {selectedIncident.entite_source} · {selectedIncident.entite_id}</div>
                            <div><span className="font-medium">Décision IA:</span> {selectedIncident.decision_ia} · Confiance {(selectedIncident.confiance_ia * 100).toFixed(0)}%</div>
                            <div><span className="font-medium">Décision humaine:</span> {selectedIncident.decision_humaine || '—'}</div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.status}</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as IncidentStatut)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] bg-white"
                                >
                                    {STATUT_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                            {dict.status[s as keyof typeof dict.status] ?? s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {newStatus === "RESOLU" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.notes}</label>
                                    <textarea
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] min-h-[100px] text-sm"
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder={dict.modal.notesPlaceholder}
                                    />
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
                                >
                                    {dict.modal.cancel}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || (newStatus === "RESOLU" && !resolutionNotes.trim())}
                                    className="flex-1 px-4 py-2 font-medium rounded-xl transition-colors text-white disabled:opacity-50"
                                    style={{ backgroundColor: "#4CAF50" }}
                                >
                                    {isSaving ? "Enregistrement..." : dict.modal.save}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
