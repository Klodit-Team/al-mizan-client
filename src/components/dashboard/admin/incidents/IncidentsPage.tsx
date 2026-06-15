"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { getAdminIncidents, resolveAdminIncident, type AIIncident, type ResolveIncidentInput } from "@/services/admin/incidents";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const TYPE_ICONS: Record<string, string> = {
  ANOMALY: "⚠",
  DIVERGENCE_EVALUATION: "⚖",
  DIVERGENCE_GRE_A_GRE: "🔀",
  LOW_CONFIDENCE_OCR: "🔍",
};

interface IncidentsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['incidentsPage'];
}

function getSeverityStyles(gravite: string) {
  switch (gravite) {
    case "CRITIQUE": return "bg-red-50 text-red-700 border-red-200";
    case "ELEVEE":   return "bg-orange-50 text-orange-700 border-orange-200";
    case "MOYENNE":  return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "FAIBLE":   return "bg-blue-50 text-blue-700 border-blue-200";
    default:         return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getStatusStyles(statut: string) {
  switch (statut) {
    case "EMISE":    return "bg-blue-100 text-blue-800";
    case "EN_COURS": return "bg-yellow-100 text-yellow-800";
    case "RESOLU":   return "bg-green-100 text-green-800";
    case "FERME":    return "bg-gray-100 text-gray-800";
    default:         return "bg-gray-100 text-gray-800";
  }
}

const STATUS_LABELS: Record<string, string> = {
  EMISE: "Émise", EN_COURS: "En cours", RESOLU: "Résolu", FERME: "Fermé",
};

const GRAVITE_LABELS: Record<string, string> = {
  CRITIQUE: "Critique", ELEVEE: "Élevée", MOYENNE: "Moyenne", FAIBLE: "Faible",
};

export default function IncidentsPage({ locale, dict }: IncidentsPageProps) {
    const [incidents, setIncidents] = useState<AIIncident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<AIIncident | null>(null);
    const [decisionHumaine, setDecisionHumaine] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [newStatus, setNewStatus] = useState<ResolveIncidentInput["statut"]>("RESOLU");

    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminIncidents();
            setIncidents(Array.isArray(data) ? data : []);
        } catch {
            setIncidents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchIncidents(); }, []);

    const filteredIncidents = useMemo(() => {
        return incidents.filter((inc) => {
            const q = search.toLowerCase();
            const matchSearch =
                inc.id.toLowerCase().includes(q) ||
                inc.type_incident.toLowerCase().includes(q) ||
                inc.entite_source.toLowerCase().includes(q) ||
                inc.entite_id.toLowerCase().includes(q);
            const matchStatus = statusFilter === "" || inc.statut === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [incidents, search, statusFilter]);

    const openResolveModal = (incident: AIIncident) => {
        setSelectedIncident(incident);
        setDecisionHumaine("");
        setResolutionNotes("");
        setNewStatus("RESOLU");
        setIsModalOpen(true);
    };

    const handleSaveResolve = async () => {
        if (!selectedIncident) return;
        try {
            await resolveAdminIncident(selectedIncident.id, {
                statut: newStatus,
                decision_humaine: decisionHumaine || undefined,
                notes_resolution: resolutionNotes || undefined,
            });
        } catch (e) {
            console.error("Error resolving incident:", e);
        }
        setIncidents((prev) =>
            prev.map((inc) =>
                inc.id === selectedIncident.id ? { ...inc, statut: newStatus } : inc
            )
        );
        setIsModalOpen(false);
        setSelectedIncident(null);
    };

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
                <div className="flex-1 min-w-[200px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                    >
                        <option value="">{dict.statusFilterPlaceholder}</option>
                        <option value="EMISE">Émise</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="RESOLU">Résolu</option>
                        <option value="FERME">Fermé</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-4">ID</th>
                                <th className="px-4 py-4">Type</th>
                                <th className="px-4 py-4">Entité concernée</th>
                                <th className="px-4 py-4">Gravité</th>
                                <th className="px-4 py-4">Détection</th>
                                <th className="px-4 py-4">Statut</th>
                                <th className="px-4 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Chargement…</td></tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Aucun incident trouvé.</td></tr>
                            ) : (
                                filteredIncidents.map((inc) => (
                                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 font-mono text-xs text-gray-500">{inc.id.slice(0, 8)}…</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                                                <span className="text-base">{TYPE_ICONS[inc.type_incident] ?? "•"}</span>
                                                {inc.type_incident}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs">
                                            <div className="font-medium text-gray-800">{inc.entite_source}</div>
                                            <div className="text-gray-400 font-mono">{inc.entite_id?.slice(0, 12)}…</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSeverityStyles(inc.gravite)}`}>
                                                {GRAVITE_LABELS[inc.gravite] ?? inc.gravite}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs">
                                            {inc.date_detection ? new Date(inc.date_detection).toLocaleString(locale) : "N/A"}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(inc.statut)}`}>
                                                {STATUS_LABELS[inc.statut] ?? inc.statut}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => openResolveModal(inc)}
                                                className="text-[#4CAF50] hover:text-green-700 font-medium text-xs transition-colors"
                                            >
                                                Voir / Résoudre
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resolve Modal */}
            {isModalOpen && selectedIncident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900">Incident : {selectedIncident.type_incident}</h2>

                        {/* Read-only AI context */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Contexte IA (lecture seule)</p>
                            {selectedIncident.decision_ia && (
                                <div className="text-xs text-slate-700"><span className="font-medium">Décision IA :</span> {selectedIncident.decision_ia}</div>
                            )}
                            {selectedIncident.ecart_score !== undefined && selectedIncident.ecart_score !== null && (
                                <div className="text-xs text-slate-700"><span className="font-medium">Écart score :</span> {selectedIncident.ecart_score} pts</div>
                            )}
                            {selectedIncident.confiance_ia !== undefined && selectedIncident.confiance_ia !== null && (
                                <div className="text-xs text-slate-700"><span className="font-medium">Confiance IA :</span> {(selectedIncident.confiance_ia * 100).toFixed(0)}%</div>
                            )}
                            <div className="text-xs text-slate-700">
                                <span className="font-medium">Entité :</span> {selectedIncident.entite_source} / <span className="font-mono">{selectedIncident.entite_id}</span>
                            </div>
                        </div>

                        {/* Editable fields */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as ResolveIncidentInput["statut"])}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] bg-white text-sm"
                                >
                                    <option value="EN_COURS">En cours</option>
                                    <option value="RESOLU">Résolu</option>
                                    <option value="FERME">Fermé</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Décision humaine</label>
                                <textarea
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] min-h-[80px] text-sm"
                                    value={decisionHumaine}
                                    onChange={(e) => setDecisionHumaine(e.target.value)}
                                    placeholder="Indiquez votre décision ou justification…"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes de résolution</label>
                                <textarea
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] min-h-[70px] text-sm"
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    placeholder="Observations complémentaires…"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveResolve}
                                className="flex-1 px-4 py-2 font-medium rounded-xl transition-colors text-white text-sm"
                                style={{ backgroundColor: "#4CAF50" }}
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
