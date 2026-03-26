"use client";
import { useState, useEffect } from "react";
import { type User } from "../users/types";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface OperateursPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['operateursPage'];
}

const dummyOperateurs: User[] = [
    { id: "2", username: "Sara Hamdi", email: "s.hamdi@btpplus.dz", role: "OPERATEUR_ECONOMIQUE", organisation_id: "3", created_at: "2023-07-01T10:00:00Z", is_active: true },
    { id: "6", username: "Mohamed Ali", email: "m.ali@entreprise.dz", role: "OPERATEUR_ECONOMIQUE", organisation_id: "4", created_at: "2023-09-11T10:00:00Z", is_active: false, is_blacklisted: true, blacklist_motif: "Non respect des délais" }
];

export default function OperateursPage({ locale, dict }: OperateursPageProps) {
    const [operateurs, setOperateurs] = useState<User[]>(dummyOperateurs);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [blacklistModal, setBlacklistModal] = useState<{isOpen: boolean; user: User | null; motif: string}>({ isOpen: false, user: null, motif: "" });

    const fetchOperateurs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/operateurs`);
            if (res.ok) {
                const data = await res.json();
                setOperateurs(data);
            }
        } catch (error) {
            console.error("Error fetching operateurs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOperateurs();
    }, []);

    const handleBlacklistSubmit = async () => {
        if (!blacklistModal.user) return;
        const userId = blacklistModal.user.id;
        
        // Optimistic update
        setOperateurs(operateurs.map(u => u.id === userId ? { ...u, is_blacklisted: true, blacklist_motif: blacklistModal.motif, is_active: false } : u));
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/blacklist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ motif: blacklistModal.motif })
            });
            if (!res.ok) {
                fetchOperateurs();
            }
        } catch (error) {
            console.error(error);
            fetchOperateurs();
        } finally {
            setBlacklistModal({ isOpen: false, user: null, motif: "" });
        }
    };

    const handleRemoveBlacklist = async (userId: string) => {
        // Optimistic update
        setOperateurs(operateurs.map(u => u.id === userId ? { ...u, is_blacklisted: false, blacklist_motif: undefined, is_active: true } : u));
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/blacklist`, {
                method: "DELETE"
            });
            if (!res.ok) {
                fetchOperateurs();
            }
        } catch (error) {
            console.error("Error removing blacklist:", error);
            fetchOperateurs();
        }
    };

    const filtered = operateurs.filter((op) => 
        op.username.toLowerCase().includes(search.toLowerCase()) || 
        op.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = operateurs.filter((u) => u.is_active && !u.is_blacklisted).length;
    const blacklistedCount = operateurs.filter((u) => u.is_blacklisted).length;

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
                    placeholder={dict.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700">{dict.listTitle} ({filtered.length})</h2>
                </div>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                        <p className="text-sm">{dict.noOperators}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.name}</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.email}</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.status}</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.createdAt}</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1e2535" }}>
                                                    {user.username.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-500">{user.email}</td>
                                        <td className="px-5 py-3">
                                            <span 
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.is_blacklisted ? "bg-red-50 text-red-600" : user.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
                                                title={user.is_blacklisted ? user.blacklist_motif : undefined}
                                            >
                                                {user.is_blacklisted ? dict.statusLabels.blacklisted : user.is_active ? dict.statusLabels.active : dict.statusLabels.inactive}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {!user.is_blacklisted ? (
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
                                {dict.modal.warning1} <strong>{blacklistModal.user?.username}</strong>. 
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
