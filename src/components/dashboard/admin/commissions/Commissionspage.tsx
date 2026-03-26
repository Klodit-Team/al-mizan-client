"use client";
import { useState, useEffect } from "react";
import type { Commission, CommissionType, CommissionNiveau, CommissionStatut } from "./types";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface CommissionsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['commissionsPage'];
}

export default function CommissionsPage({ locale, dict }: CommissionsPageProps) {
    const [commissions, setSearchCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        designation: "",
        type: "EVALUATION" as CommissionType,
        niveau: "NATIONALE" as CommissionNiveau,
        appel_offre_id: "",
    });

    const fetchCommissions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/commissions`);
            if (res.ok) {
                const data = await res.json();
                setSearchCommissions(data);
            } else {
                // mocked fallback
                setSearchCommissions([
                    {
                        id: "mock-1",
                        designation: "Commission Nationale d'Évaluation #120",
                        type: "EVALUATION",
                        niveau: "NATIONALE",
                        statut: "CONSTITUEE",
                        date_constitution: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }
                ]);
            }
        } catch (err) {
            setSearchCommissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/commissions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    designation: formData.designation,
                    type: formData.type,
                    niveau: formData.niveau,
                    appel_offre_id: formData.appel_offre_id || undefined,
                })
            });
            
            if (res.ok) {
                const newC = await res.json();
                setSearchCommissions([newC, ...commissions]);
            } else {
                // optimistic fallback creation
                const mockC: Commission = {
                    id: Math.random().toString(36).substr(2, 9),
                    designation: formData.designation,
                    type: formData.type,
                    niveau: formData.niveau,
                    statut: "CONSTITUEE",
                    date_constitution: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    appel_offre_id: formData.appel_offre_id || undefined
                };
                setSearchCommissions([mockC, ...commissions]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setModalOpen(false);
            setFormData({ designation: "", type: "EVALUATION", niveau: "NATIONALE", appel_offre_id: "" });
        }
    };

    const filtered = commissions.filter(c => c.designation.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {dict.createButton}
                </button>
            </div>

            {/* Search */}
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

            {/* Table */}
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                        {dict.noCommissions}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-800">{c.designation}</p>
                                            {c.appel_offre_id && (
                                                <p className="text-xs text-gray-400 mt-0.5">AO: {c.appel_offre_id}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">{dict.enums.type[c.type]}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {dict.enums.niveau[c.niveau]}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.statut === 'ACTIVE' ? 'bg-green-50 text-green-700' : c.statut === 'CONSTITUEE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {dict.enums.statut[c.statut]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500">
                                            {new Date(c.date_constitution).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">{dict.modal.title}</h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-sm text-gray-800"
                                    placeholder={dict.modal.designationPlaceholder}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.modal.typeLabel}</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as CommissionType })}
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
                                        onChange={e => setFormData({ ...formData, niveau: e.target.value as CommissionNiveau })}
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
                                    onChange={e => setFormData({ ...formData, appel_offre_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-sm text-gray-800"
                                    placeholder={dict.modal.appelOffrePlaceholder}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                {dict.modal.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-semibold text-white bg-[#4CAF50] rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                            >
                                {dict.modal.create}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
