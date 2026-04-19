"use client";
import { useState, useEffect } from "react";
import CommissionRow from "./CommissionRow";
import StatutBadge from "./StatutBadge";
import type { MembreCommission, CommissionStatut } from "./types";

// ── Mocked data ──────────────────────────────────────────────────────────────
const MOCK_COMMISSIONS: MembreCommission[] = [
    {
        id: "c-001",
        designation: "Commission d'Évaluation Tech/Fin",
        appelOffre: { id: "ao-001", reference: "AO-2023-089", objet: "Acquisition Matériel IT" },
        monRole: "Président",
        dateConstitution: "2023-10-12T00:00:00Z",
        statut: "ACTIVE",
    },
    {
        id: "c-002",
        designation: "Commission Sectorielle BTP",
        appelOffre: { id: "ao-002", reference: "AO-2024-012", objet: "Rénovation Siège" },
        monRole: "Évaluateur",
        dateConstitution: "2023-11-05T00:00:00Z",
        statut: "CONSTITUEE",
    },
    {
        id: "c-003",
        designation: "Commission d'Ouverture",
        appelOffre: { id: "ao-003", reference: "AO-2022-004", objet: "Fournitures Bureau" },
        monRole: "Rapporteur",
        dateConstitution: "2022-01-10T00:00:00Z",
        statut: "DISSOUTE",
    },
];

const STATUTS: { label: string; value: CommissionStatut | "ALL" }[] = [
    { label: "Tous les statuts", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Constituée", value: "CONSTITUEE" },
    { label: "Dissoute", value: "DISSOUTE" },
];

interface MesCommissionsPageProps {
    locale: string;
    userId: string;
    dict: Record<string, any>;
}

export default function MesCommissionsPage({ locale, userId, dict }: MesCommissionsPageProps) {
    const [commissions, setCommissions] = useState<MembreCommission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<CommissionStatut | "ALL">("ALL");

    useEffect(() => {
        const fetchCommissions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/commissions/${userId}/mes-commissions`,
                    { credentials: "include" }
                );
                if (res.ok) {
                    const data = await res.json();
                    setCommissions(data);
                } else {
                    setCommissions(MOCK_COMMISSIONS);
                }
            } catch {
                setCommissions(MOCK_COMMISSIONS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCommissions();
    }, [userId]);

    const filtered = commissions.filter((c) => {
        const matchSearch =
            c.designation.toLowerCase().includes(search.toLowerCase()) ||
            c.appelOffre.reference.toLowerCase().includes(search.toLowerCase()) ||
            c.appelOffre.objet.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "ALL" || c.statut === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: commissions.length,
        active: commissions.filter((c) => c.statut === "ACTIVE").length,
        constituee: commissions.filter((c) => c.statut === "CONSTITUEE").length,
        dissoute: commissions.filter((c) => c.statut === "DISSOUTE").length,
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {dict.subtitle}
                    </p>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-semibold text-gray-700">{stats.total}</span> {stats.total !== 1 ? dict.stats.totalPlural : dict.stats.total}
                </span>
            </div>

            {/* ── Stats Row ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: dict.stats.active, count: stats.active, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { label: dict.stats.constituee, count: stats.constituee, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                    { label: dict.stats.dissoute, count: stats.dissoute, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}>
                        <span className={`text-2xl font-bold ${s.color}`}>{s.count}</span>
                        <span className="text-sm font-medium text-gray-600">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
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
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white text-gray-700 transition-all"
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2">
                    {STATUTS.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => setStatusFilter(s.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s.value
                                    ? "bg-[#4CAF50] text-white border-[#4CAF50] shadow-sm"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                                }`}
                        >
                            {s.value === "ALL" ? dict.filters.all : dict.filters[s.value]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                {[
                                    dict.columns.designation,
                                    dict.columns.appelOffre,
                                    dict.columns.monRole,
                                    dict.columns.dateConstitution,
                                    dict.columns.statut,
                                    dict.columns.actions,
                                ].map((col) => (
                                    <th
                                        key={col}
                                        className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                // Skeleton rows
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${60 + (j * 10) % 30}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-sm text-gray-400 font-medium">{dict.noCommissions}</p>
                                            {search && (
                                                <button
                                                    onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                                                    className="text-xs text-emerald-600 hover:underline mt-1"
                                                >
                                                    {dict.resetFilters}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((commission) => (
                                    <CommissionRow
                                        key={commission.id}
                                        commission={commission}
                                        locale={locale}
                                        dict={dict}
                                        userId={userId}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {!isLoading && filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-400">
                            {filtered.length} {filtered.length !== 1 ? dict.resultsCountPlural : dict.resultsCount}
                            {statusFilter !== "ALL" || search ? ` ${dict.filtered}` : ""}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
