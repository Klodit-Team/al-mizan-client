"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface AIIncident {
    id: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    date: string;
    description: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
    assignedTo?: string;
}

const defaultIncidents: AIIncident[] = [
    { id: "INC-2024-001", severity: "HIGH", date: "2024-03-10T10:30:00Z", description: "Anomalie détectée dans les prix unitaires de l'offre #LOT-3.", status: "OPEN" },
    { id: "INC-2024-002", severity: "MEDIUM", date: "2024-03-11T14:15:00Z", description: "Comportement suspect lors de la soumission de l'opérateur X.", status: "IN_PROGRESS", assignedTo: "Karim Ziani" },
    { id: "INC-2024-003", severity: "LOW", date: "2024-03-09T09:00:00Z", description: "Écart mineur dans les délais de soumission.", status: "RESOLVED", assignedTo: "Ahmed Mansour" },
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
    const [assignedTo, setAssignedTo] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [newStatus, setNewStatus] = useState<"OPEN" | "IN_PROGRESS" | "RESOLVED">("RESOLVED");

    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/incidents`);
            if (res.ok) {
                const data = await res.json();
                setIncidents(data);
            } else {
                setIncidents(defaultIncidents);
            }
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
            const matchSearch = inc.description.toLowerCase().includes(search.toLowerCase()) || 
                                inc.id.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "" || inc.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [incidents, search, statusFilter]);

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "HIGH": return "bg-red-50 text-red-700 border-red-200";
            case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "LOW": return "bg-blue-50 text-blue-700 border-blue-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-red-100 text-red-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "RESOLVED": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const openResolveModal = (incident: AIIncident) => {
        setSelectedIncident(incident);
        setAssignedTo(incident.assignedTo || "");
        setResolutionNotes("");
        setNewStatus(incident.status === "RESOLVED" ? "RESOLVED" : "IN_PROGRESS");
        setIsModalOpen(true);
    };

    const handleSaveResolve = async () => {
        if (!selectedIncident) return;
        
        // Simulating API call to update the incident
        const updatedIncidents = incidents.map(inc => {
            if (inc.id === selectedIncident.id) {
                return { ...inc, assignedTo, status: newStatus };
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
                        <option value="OPEN">{dict.status.OPEN}</option>
                        <option value="IN_PROGRESS">{dict.status.IN_PROGRESS}</option>
                        <option value="RESOLVED">{dict.status.RESOLVED}</option>
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
                                <th className="px-6 py-4">{dict.columns.description}</th>
                                <th className="px-6 py-4">{dict.columns.status}</th>
                                <th className="px-6 py-4">{dict.columns.assignedTo}</th>
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
                                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{inc.id}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSeverityStyles(inc.severity)}`}>
                                                {dict.severity[inc.severity as keyof typeof dict.severity]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(inc.date).toLocaleString(locale)}</td>
                                        <td className="px-6 py-4 truncate max-w-[300px]" title={inc.description}>{inc.description}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(inc.status)}`}>
                                                {dict.status[inc.status as keyof typeof dict.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{inc.assignedTo || "-"}</td>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.assignedTo}</label>
                                <input
                                    type="text"
                                    value={assignedTo}
                                    placeholder={dict.modal.assignedToPlaceholder}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{dict.modal.status}</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED")}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#4CAF50] bg-white"
                                >
                                    <option value="OPEN">{dict.status.OPEN}</option>
                                    <option value="IN_PROGRESS">{dict.status.IN_PROGRESS}</option>
                                    <option value="RESOLVED">{dict.status.RESOLVED}</option>
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
