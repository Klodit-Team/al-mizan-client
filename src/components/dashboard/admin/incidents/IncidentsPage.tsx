"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { getAdminIncidents, resolveAdminIncident, type AIIncident } from "@/services/admin/incidents";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const defaultIncidents: AIIncident[] = [
    { incidentId: "INC-2024-001", utilisateursCibles: ["user-1", "user-2"], titre: "Anomalie détectée", message: "Anomalie détectée dans les prix unitaires de l'offre #LOT-3.", niveauUrgence: "CRITICAL", typeAlerte: "DIVERGENCE_GRE_A_GRE", donneesContexte: { lotId: "LOT-3" }, statut: "EMISE", created_at: "2024-03-10T10:30:00Z" },
    { incidentId: "INC-2024-002", utilisateursCibles: ["user-3"], titre: "Comportement suspect", message: "Comportement suspect lors de la soumission de l'opérateur X.", niveauUrgence: "WARNING", typeAlerte: "DIVERGENCE_GRE_A_GRE", donneesContexte: { operateurId: "X" }, statut: "EMISE", created_at: "2024-03-11T14:15:00Z" },
    { incidentId: "INC-2024-003", utilisateursCibles: ["user-4"], titre: "Écart mineur", message: "Écart mineur dans les délais de soumission.", niveauUrgence: "INFO", typeAlerte: "DIVERGENCE_GRE_A_GRE", donneesContexte: { delai: "2h" }, statut: "EMISE", created_at: "2024-03-09T09:00:00Z" },
];

interface IncidentsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['incidentsPage'];
}

export default function IncidentsPage({ locale, dict }: IncidentsPageProps) {
    const [incidents, setIncidents] = useState<AIIncident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<AIIncident | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [newStatus, setNewStatus] = useState<string>("RESOLVED");

    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminIncidents();
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
    }, []);

    const filteredIncidents = useMemo(() => {
        return incidents.filter((inc) => {
            const matchSearch = inc.titre.toLowerCase().includes(search.toLowerCase()) || 
                                inc.message.toLowerCase().includes(search.toLowerCase()) ||
                                inc.incidentId.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "" || inc.statut === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [incidents, search, statusFilter]);

    const getSeverityStyles = (niveauUrgence: string) => {
        switch (niveauUrgence) {
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200";
            case "ERROR": return "bg-red-50 text-red-700 border-red-200";
            case "WARNING": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "INFO": return "bg-blue-50 text-blue-700 border-blue-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusStyles = (statut: string) => {
        switch (statut) {
            case "EMISE": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const openResolveModal = (incident: AIIncident) => {
        setSelectedIncident(incident);
        setResolutionNotes("");
        setNewStatus("RESOLVED");
        setIsModalOpen(true);
    };

    const handleSaveResolve = async () => {
        if (!selectedIncident) return;

        const payload = {
            statut: newStatus,
            resolutionNotes,
        };

        try {
            await resolveAdminIncident(selectedIncident.incidentId, payload);
        } catch (error) {
            console.error("Error resolving incident:", error);
        }

        const updatedIncidents = incidents.map((inc) => {
            if (inc.incidentId === selectedIncident.incidentId) {
                return { ...inc, statut: newStatus };
            }
            return inc;
        });

        setIncidents(updatedIncidents);
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
                        <option value="EMISE">{dict.status.EMISE}</option>
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
                                <th className="px-6 py-4">{dict.columns.severity}</th>
                                <th className="px-6 py-4">{dict.columns.date}</th>
                                <th className="px-6 py-4">{dict.columns.title}</th>
                                <th className="px-6 py-4">{dict.columns.message}</th>
                                <th className="px-6 py-4">{dict.columns.status}</th>
                                <th className="px-6 py-4">{dict.columns.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Aucun incident trouvé.</td></tr>
                            ) : (
                                filteredIncidents.map((inc) => (
                                    <tr key={inc.incidentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{inc.incidentId}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSeverityStyles(inc.niveauUrgence)}`}>
                                                {dict.severity[inc.niveauUrgence as keyof typeof dict.severity] || inc.niveauUrgence}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{inc.created_at ? new Date(inc.created_at).toLocaleString(locale) : 'N/A'}</td>
                                        <td className="px-6 py-4 truncate max-w-[200px]" title={inc.titre}>{inc.titre}</td>
                                        <td className="px-6 py-4 truncate max-w-[300px]" title={inc.message}>{inc.message}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(inc.statut)}`}>
                                                {dict.status[inc.statut as keyof typeof dict.status] || inc.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
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

            {/* Modal */}
            {isModalOpen && selectedIncident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{dict.modal.title}</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.status}</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] bg-white"
                                >
                                    <option value="EMISE">{dict.status.EMISE}</option>
                                    <option value="RESOLVED">Résolu</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.notes}</label>
                                <textarea
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] min-h-[100px]"
                                    value={resolutionNotes}
                                    onChange={e => setResolutionNotes(e.target.value)}
                                    placeholder={dict.modal.notesPlaceholder}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
                                >
                                    {dict.modal.cancel}
                                </button>
                                <button
                                    onClick={handleSaveResolve}
                                    className="flex-1 px-4 py-2 font-medium rounded-xl transition-colors text-white"
                                    style={{ backgroundColor: "#4CAF50" }}
                                >
                                    {dict.modal.save}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
