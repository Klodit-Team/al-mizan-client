"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Organisation } from "./types";

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const typeColors: Record<string, string> = {
    EPA: "bg-blue-50 text-blue-600",
    EPIC: "bg-purple-50 text-purple-600",
    MINISTERE: "bg-indigo-50 text-indigo-600",
    ENTREPRISE_PRIVEE: "bg-orange-50 text-orange-600",
    ENTREPRISE_PUBLIQUE: "bg-teal-50 text-teal-600",
    GROUPEMENT: "bg-pink-50 text-pink-600",
};

interface OrganisationCardProps {
    org: Organisation;
    locale: string;
    dict: CommonDict['dashboard']['admin']['organisationsPage'];
}

export default function OrganisationCard({ org, locale, dict }: OrganisationCardProps) {
    const params = useParams();
    const adminId = params?.adminId || "admin";
    const typeLabels: Record<string, string> = {
        EPA: dict.types.EPA,
        EPIC: dict.types.EPIC,
        MINISTERE: dict.types.MINISTERE,
        ENTREPRISE_PRIVEE: dict.types.ENTREPRISE_PRIVEE,
        ENTREPRISE_PUBLIQUE: dict.types.ENTREPRISE_PUBLIQUE,
        GROUPEMENT: dict.types.GROUPEMENT,
    };

    const initials = org.denomination.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    return (
        <Link href={`/${locale}/dashboard/admin/${adminId}/organisations/${org.id}`}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#1e2535" }}>
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 group-hover:text-[#4CAF50] transition-colors line-clamp-1">{org.denomination}</p>
                            <p className="text-xs text-gray-400">{org.wilaya}, {org.commune}</p>
                        </div>
                    </div>
                    {/* Verified badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${org.is_verified ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                        {org.is_verified ? dict.card.verified : dict.card.pending}
                    </span>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {org.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {org.telephone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        NIF: {org.nif} · RC: {org.registre_commerce}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[org.type]}`}>
                        {typeLabels[org.type]}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(org.created_at).toLocaleDateString("fr-DZ")}
                    </span>
                </div>
            </div>
        </Link>
    );
}