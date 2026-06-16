"use client";
import Link from "next/link";
import StatutBadge from "./StatutBadge";
import type { MembreCommission, CommissionDict } from "./types";

interface CommissionRowProps {
    commission: MembreCommission;
    locale: string;
    dict: CommissionDict;
}

export default function CommissionRow({ commission, locale, dict }: CommissionRowProps) {
    const roleKeyMap: Record<string, string> = {
        "Président": "president",
        "Évaluateur": "evaluateur",
        "Rapporteur": "rapporteur",
        "Membre": "membre",
        "Observateur": "observateur"
    };

    const roleKey = roleKeyMap[commission.monRole] || "membre";

    return (
        <tr className="hover:bg-emerald-50/30 transition-colors group">
            {/* Désignation */}
            <td className="px-5 py-4">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                    {commission.designation}
                </p>
            </td>

            {/* Appel d'Offres */}
            <td className="px-5 py-4">
                <p className="text-sm font-medium text-gray-700">{commission.appelOffre.reference}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{commission.appelOffre.objet}</p>
            </td>

            {/* Mon Rôle */}
            <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {dict.roles?.[roleKey] ?? roleKey}
                </span>
            </td>

            {/* Date Constitution */}
            <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                {new Date(commission.dateConstitution).toLocaleDateString(
                    locale === "ar" ? "ar-DZ" : "fr-DZ",
                    { day: "2-digit", month: "short", year: "numeric" }
                )}
            </td>

            {/* Statut */}
            <td className="px-5 py-4">
                <StatutBadge statut={commission.statut} dict={dict.statuts ?? {}} />
            </td>

            {/* Actions */}
            <td className="px-5 py-4">
                <Link
                    href={`/${locale}/dashboard/commission/details/${commission.id}`}
                    title={dict.actions}
                    className="inline-flex items-center gap-2 rounded-full bg-[#4CAF50] px-4 py-2 text-white text-sm font-semibold shadow-sm shadow-emerald-200 hover:bg-[#43A047] transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l7 7-7 7" />
                    </svg>
                    Accéder à la séance
                </Link>
            </td>
        </tr>
    );
}
