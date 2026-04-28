"use client";
import Link from "next/link";
import StatutBadge from "./StatutBadge";
import type { MembreCommission } from "./types";

interface CommissionRowProps {
    commission: MembreCommission;
    locale: string;
    dict: Record<string, any>;
    userId: string;
}

export default function CommissionRow({ commission, locale, dict, userId }: CommissionRowProps) {
    const roleKeyMap: Record<string, string> = {
        "Président": "president",
        "Évaluateur": "evaluateur",
        "Rapporteur": "rapporteur",
        "Membre": "membre"
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
                    {dict.roles[roleKey]}
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
                <StatutBadge statut={commission.statut} dict={dict.statuts} />
            </td>

            {/* Actions */}
            <td className="px-5 py-4">
                <Link
                    href={`/${locale}/dashboard/commission/${userId}/mes-commissions/${commission.appelOffre.id}`}
                    title={dict.actions}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </Link>
            </td>
        </tr>
    );
}
