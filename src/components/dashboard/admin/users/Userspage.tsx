"use client";
import { useState, useEffect } from "react";
import { type User } from "./types";

const dummyUsers: User[] = [
    { id: "1", username: "Karim Bensalem", email: "k.bensalem@btpplus.dz", role: "SERVICE_CONTRACTANT", organisation_id: "3", created_at: "2023-06-20T08:00:00Z", is_active: true },
    { id: "2", username: "Sara Hamdi", email: "s.hamdi@btpplus.dz", role: "OPERATEUR_ECONOMIQUE", organisation_id: "3", created_at: "2023-07-01T10:00:00Z", is_active: true },
    { id: "3", username: "Yacine Drif", email: "y.drif@btpplus.dz", role: "MEMBRE_COMMISSION", organisation_id: "3", created_at: "2023-08-15T09:00:00Z", is_active: false },
    { id: "4", username: "Admin User", email: "admin@platform.dz", role: "ADMIN", organisation_id: "1", created_at: "2023-01-01T08:00:00Z", is_active: true },
    { id: "5", username: "Controleur User", email: "controle@platform.dz", role: "CONTROLEUR", organisation_id: "2", created_at: "2023-05-12T08:00:00Z", is_active: true },
];

const roleLabels: Record<string, string> = {
    ADMIN: "Administrateur",
    SERVICE_CONTRACTANT: "Service Contractant",
    OPERATEUR_ECONOMIQUE: "Opérateur Économique",
    MEMBRE_COMMISSION: "Membre Commission",
    CONTROLEUR: "Contrôleur",
};

interface UsersPageProps {
    locale: string;
}

export default function UsersPage({ locale }: UsersPageProps) {
    const [users, setUsers] = useState<User[]>(dummyUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | "all">("all");
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) {
                // Revert on failure
                console.error("Failed to update role");
                fetchUsers();
            }
        } catch (error) {
            console.error("Error updating role:", error);
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
                    <h1 className="text-xl font-bold text-gray-800">Utilisateurs</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Gérez les utilisateurs et leurs habilitations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
                        <p className="text-xs text-gray-400">Actifs</p>
                        <p className="text-lg font-bold text-green-500">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
                        <p className="text-xs text-gray-400">Inactifs</p>
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
                        placeholder="Rechercher par nom, email..."
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
                        Tous les rôles
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
                    <h2 className="text-sm font-bold text-gray-700">Liste des utilisateurs ({filtered.length})</h2>
                </div>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm">Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nom</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle & Attribution</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Créé le</th>
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
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                                {user.is_active ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString("fr-DZ")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
