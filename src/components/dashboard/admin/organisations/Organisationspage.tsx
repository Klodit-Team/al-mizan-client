"use client";
import { useState, useEffect } from "react";
import OrganisationCard from "./Organisationcard";
import { type Organisation, type OrgType } from "./types";

const dummyOrgs: Organisation[] = [
    { id: "1", denomination: "Ministère de l'Énergie et des Mines", nif: "123456789012345", nis: "12345678901234", registre_commerce: "RC-2020-001", adresse: "Rue Didouche Mourad", wilaya: "Alger", commune: "Hussein Dey", telephone: "+213 21 000 001", email: "contact@energie.gov.dz", type: "MINISTERE", is_verified: true, created_at: "2023-01-15T10:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    { id: "2", denomination: "TechBuild SARL", nif: "987654321098765", nis: "98765432109876", registre_commerce: "RC-2019-045", adresse: "Zone Industrielle Rouiba", wilaya: "Alger", commune: "Rouiba", telephone: "+213 21 000 002", email: "info@techbuild.dz", type: "ENTREPRISE_PRIVEE", is_verified: true, created_at: "2023-03-10T09:00:00Z", updated_at: "2024-02-01T00:00:00Z" },
    { id: "3", denomination: "BTP-Plus SPA", nif: "111222333444555", nis: "11122233344455", registre_commerce: "RC-2021-078", adresse: "Cité des Annassers", wilaya: "Alger", commune: "Kouba", telephone: "+213 21 000 003", email: "contact@btpplus.dz", type: "ENTREPRISE_PUBLIQUE", is_verified: false, created_at: "2023-06-20T08:00:00Z", updated_at: "2024-03-01T00:00:00Z" },
    { id: "4", denomination: "Agence Nationale de l'Eau", nif: "222333444555666", nis: "22233344455566", registre_commerce: "RC-2018-012", adresse: "Boulevard Krim Belkacem", wilaya: "Alger", commune: "El Mouradia", telephone: "+213 21 000 004", email: "info@ane.gov.dz", type: "EPA", is_verified: true, created_at: "2023-02-05T11:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
    { id: "5", denomination: "Sonelgaz EPIC", nif: "333444555666777", nis: "33344455566677", registre_commerce: "RC-2015-003", adresse: "Boulevard Khelifa Boukhalfa", wilaya: "Alger", commune: "Hydra", telephone: "+213 21 000 005", email: "contact@sonelgaz.dz", type: "EPIC", is_verified: false, created_at: "2023-08-12T14:00:00Z", updated_at: "2024-04-01T00:00:00Z" },
    { id: "6", denomination: "Groupement Hydraulique Nord", nif: "444555666777888", nis: "44455566677788", registre_commerce: "RC-2022-099", adresse: "Rue des Frères Bouadou", wilaya: "Blida", commune: "Blida", telephone: "+213 25 000 006", email: "info@ghn.dz", type: "GROUPEMENT", is_verified: false, created_at: "2023-11-01T10:00:00Z", updated_at: "2024-05-01T00:00:00Z" },
];

const typeFilters: { key: OrgType | "all"; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "MINISTERE", label: "Ministère" },
    { key: "EPA", label: "EPA" },
    { key: "EPIC", label: "EPIC" },
    { key: "ENTREPRISE_PRIVEE", label: "Entreprise Privée" },
    { key: "ENTREPRISE_PUBLIQUE", label: "Entreprise Publique" },
    { key: "GROUPEMENT", label: "Groupement" },
];

interface OrganisationsPageProps {
    locale: string;
}

export default function OrganisationsPage({ locale }: OrganisationsPageProps) {
    const [organisations, setOrganisations] = useState<Organisation[]>(dummyOrgs);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<OrgType | "all">("all");
    const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "pending">("all");
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrganisations = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/organisations");
            if (res.ok) {
                const data = await res.json();
                setOrganisations(data);
            } else {
                console.error("Failed to fetch organisations");
            }
        } catch (error) {
            console.error("Error fetching organisations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganisations();
    }, []);

    const filtered = organisations.filter((org) => {
        const matchSearch = org.denomination.toLowerCase().includes(search.toLowerCase()) ||
            org.wilaya.toLowerCase().includes(search.toLowerCase()) ||
            org.nif.includes(search);
        const matchType = typeFilter === "all" || org.type === typeFilter;
        const matchVerified = verifiedFilter === "all" ||
            (verifiedFilter === "verified" && org.is_verified) ||
            (verifiedFilter === "pending" && !org.is_verified);
        return matchSearch && matchType && matchVerified;
    });

    const verifiedCount = organisations.filter((o) => o.is_verified).length;
    const pendingCount = organisations.filter((o) => !o.is_verified).length;

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Organisations</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Gérez et vérifiez les organisations enregistrées.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
                        <p className="text-xs text-gray-400">Vérifiées</p>
                        <p className="text-lg font-bold text-green-500">{verifiedCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center shadow-sm">
                        <p className="text-xs text-gray-400">En attente</p>
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
                        placeholder="Rechercher par nom, wilaya, NIF..."
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
                                {v === "all" ? "Tous" : v === "verified" ? "✓ Vérifiées" : "⏳ En attente"}
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
                    <p className="text-sm">Aucune organisation trouvée</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filtered.map((org) => (
                        <OrganisationCard key={org.id} org={org} locale={locale} />
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-400">Affichage de {filtered.length} sur {organisations.length} organisations</p>
        </div>
    );
}