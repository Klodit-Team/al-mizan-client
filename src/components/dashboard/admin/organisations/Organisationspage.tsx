"use client";
import { useState, useEffect } from "react";
import OrganisationCard from "./Organisationcard";
import { type Organisation, type OrgType } from "./types";
import { useOrganisationsQuery } from "@/services/admin";



import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface OrganisationsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['organisationsPage'];
}

export default function OrganisationsPage({ locale, dict }: OrganisationsPageProps) {
    const typeFilters: { key: OrgType | "all"; label: string }[] = [
        { key: "all", label: dict.types.all },
        { key: "MINISTERE", label: dict.types.MINISTERE },
        { key: "EPA", label: dict.types.EPA },
        { key: "EPIC", label: dict.types.EPIC },
        { key: "ENTREPRISE_PRIVEE", label: dict.types.ENTREPRISE_PRIVEE },
        { key: "ENTREPRISE_PUBLIQUE", label: dict.types.ENTREPRISE_PUBLIQUE },
        { key: "GROUPEMENT", label: dict.types.GROUPEMENT },
    ];

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<OrgType | "all">("all");
    const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "pending">("all");

    const { data: response, isLoading } = useOrganisationsQuery({ page: 1, limit: 100 });
    const organisations = response?.data || [];

    const filtered = organisations.filter((org) => {
        const matchSearch = org.denomination.toLowerCase().includes(search.toLowerCase()) ||
            org.wilaya.toLowerCase().includes(search.toLowerCase()) ||
            org.nif.includes(search);
        const matchType = typeFilter === "all" || org.type === typeFilter;
        const matchVerified = verifiedFilter === "all" ||
            (verifiedFilter === "verified" && org.isVerified) ||
            (verifiedFilter === "pending" && !org.isVerified);
        return matchSearch && matchType && matchVerified;
    });

    const verifiedCount = organisations.filter((o) => o.isVerified).length;
    const pendingCount = organisations.filter((o) => !o.isVerified).length;

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
                        <p className="text-xs text-gray-400">{dict.verified}</p>
                        <p className="text-lg font-bold text-green-500">{verifiedCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
                        <p className="text-xs text-gray-400">{dict.pendingText}</p>
                        <p className="text-lg font-bold text-yellow-500">{pendingCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
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

                {/* Type tabs */}
                <div className="flex flex-wrap gap-2">
                    {typeFilters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setTypeFilter(f.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${typeFilter === f.key ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
                            style={typeFilter === f.key ? { backgroundColor: "#1e2535" } : {}}
                        >
                            {f.label}
                        </button>
                    ))}
                    <div className="ml-auto flex gap-2">
                        {(["all", "verified", "pending"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setVerifiedFilter(v)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${verifiedFilter === v ? "text-white" : "bg-white border border-gray-200 text-gray-600"}`}
                                style={verifiedFilter === v ? { backgroundColor: "#4CAF50" } : {}}
                            >
                                {v === "all" ? dict.filters.all : v === "verified" ? dict.filters.verified : dict.filters.pending}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm">{dict.noOrganisations}</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filtered.map((org) => (
                        <OrganisationCard key={org.id} org={org} locale={locale} dict={dict} />
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-400">{dict.displayingCount.replace("{{filtered}}", filtered.length.toString()).replace("{{total}}", organisations.length.toString())}</p>
        </div>
    );
}