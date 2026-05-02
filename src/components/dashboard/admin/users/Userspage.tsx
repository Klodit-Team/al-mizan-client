"use client";
import { useState, useEffect } from "react";
import { type User } from "./types";
import {
  getAdminUsers,
  updateAdminUserRole,
  blacklistAdminUser,
  removeAdminUserBlacklist,
} from "@/services/admin/users";

const dummyUsers: User[] = [
    { id: "1", username: "Karim Bensalem", email: "k.bensalem@btpplus.dz", role: "SERVICE_CONTRACTANT", organisation_id: "3", created_at: "2023-06-20T08:00:00Z", is_active: true },
    { id: "2", username: "Sara Hamdi", email: "s.hamdi@btpplus.dz", role: "OPERATEUR_ECONOMIQUE", organisation_id: "3", created_at: "2023-07-01T10:00:00Z", is_active: true },
    { id: "3", username: "Yacine Drif", email: "y.drif@btpplus.dz", role: "MEMBRE_COMMISSION", organisation_id: "3", created_at: "2023-08-15T09:00:00Z", is_active: false },
    { id: "4", username: "Admin User", email: "admin@platform.dz", role: "ADMIN", organisation_id: "1", created_at: "2023-01-01T08:00:00Z", is_active: true },
    { id: "5", username: "Controleur User", email: "controle@platform.dz", role: "CONTROLEUR", organisation_id: "2", created_at: "2023-05-12T08:00:00Z", is_active: true },
];

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface UsersPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['usersPage'];
}

export default function UsersPage({ locale, dict }: UsersPageProps) {
    const roleLabels: Record<string, string> = {
        ADMIN: dict.roles.ADMIN,
        SERVICE_CONTRACTANT: dict.roles.SERVICE_CONTRACTANT,
        OPERATEUR_ECONOMIQUE: dict.roles.OPERATEUR_ECONOMIQUE,
        MEMBRE_COMMISSION: dict.roles.MEMBRE_COMMISSION,
        CONTROLEUR: dict.roles.CONTROLEUR,
    };

    const [users, setUsers] = useState<User[]>(dummyUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | "all">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [blacklistModal, setBlacklistModal] = useState<{isOpen: boolean; user: User | null; motif: string}>({ isOpen: false, user: null, motif: "" });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminUsers();
            setUsers(Array.isArray(data) ? data : dummyUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers(dummyUsers);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
        try {
            await updateAdminUserRole(userId, newRole);
        } catch (error) {
            console.error("Error updating role:", error);
            fetchUsers();
        }
    };

    const handleBlacklistSubmit = async () => {
        if (!blacklistModal.user) return;
        const userId = blacklistModal.user.id;
        
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, is_blacklisted: true, blacklist_motif: blacklistModal.motif, is_active: false } : u));
        
        try {
            await blacklistAdminUser(userId, blacklistModal.motif);
        } catch (error) {
            console.error("Error blacklisting user:", error);
            fetchUsers();
        } finally {
            setBlacklistModal({ isOpen: false, user: null, motif: "" });
        }
    };

    const handleRemoveBlacklist = async (userId: string) => {
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, is_blacklisted: false, blacklist_motif: undefined, is_active: true } : u));
        
        try {
            await removeAdminUserBlacklist(userId);
        } catch (error) {
            console.error("Error removing blacklist:", error);
            fetchUsers();
        }
    };

    const filtered = users.filter((user) => {
        const matchSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || user.role === roleFilter;
        return matchSearch && matchRole;
    });

    const activeCount = users.filter((u) => u.is_active).length;
    const inactiveCount = users.length - activeCount;

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
                        <p className="text-xs text-gray-400">{dict.active}</p>
                        <p className="text-lg font-bold text-green-500">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
                        <p className="text-xs text-gray-400">{dict.inactive}</p>
                        <p className="text-lg font-bold text-gray-400">{inactiveCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
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

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setRoleFilter("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${roleFilter === "all" ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        style={roleFilter === "all" ? { backgroundColor: "#1e2535" } : {}}
                    >
                        {dict.allRoles}
                    </button>
                    {Object.entries(roleLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setRoleFilter(key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${roleFilter === key ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
                            style={roleFilter === key ? { backgroundColor: "#1e2535" } : {}}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700">{dict.listTitle} ({filtered.length})</h2>
                </div>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm">{dict.noUsers}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.name}</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.email}</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.columns.role}</th>
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
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="text-xs font-semibold px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                                {Object.entries(roleLabels).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span 
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.is_blacklisted ? "bg-red-50 text-red-600" : user.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
                                                title={user.is_blacklisted ? user.blacklist_motif : undefined}
                                            >
                                                {user.is_blacklisted ? dict.statusLabels.blacklisted : user.is_active ? dict.statusLabels.active : dict.statusLabels.inactive}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString("fr-DZ")}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {user.role === "OPERATEUR_ECONOMIQUE" && (
                                                !user.is_blacklisted ? (
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
                                                )
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
