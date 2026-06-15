"use client";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import type { AdministratorActivityItem } from "@/services/administrator-dashboard/api";

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface ActiviteRecenteProps {
    locale: Locale;
    dict:CommonDict['dashboard']['admin']['activiteRecente'];
    activities?: AdministratorActivityItem[];
}

const defaultActivities: AdministratorActivityItem[] = [
    {
        id: "1",
        type: "update",
        title: "Statut AO #2023-045 mis à jour",
        description: "L'appel d'offres est passé en phase \"Évaluation Technique\"",
        time: "il y a 2h",
    },
    {
        id: "2",
        type: "submission",
        title: "Nouvelle soumission reçue",
        description: "Entreprise \"TechBuild SARL\" pour le lot 2 (Gros Œuvre)",
        time: "il y a 5h",
    },
    {
        id: "3",
        type: "recours",
        title: "Recours déposé",
        description: "Recours précontractuel déposé par \"BTP-Plus\" sur AO #2023-039",
        time: "Hier",
    },
    {
        id: "4",
        type: "pv",
        title: "Procès-verbal signé",
        description: "PV de la commission d'ouverture des plis #2023-048 validé",
        time: "Hier",
    },
    {
        id: "5",
        type: "marche",
        title: "Statut Marché #M23-011",
        description: "Ordre de service notifié à l'attributaire",
        time: "3 oct.",
    },
];

const iconMap = {
    update: (
        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </div>
    ),
    submission: (
        <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
    ),
    recours: (
        <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
    ),
    pv: (
        <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    ),
    marche: (
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        </div>
    ),
};

export default function ActiviteRecente({ locale, dict, activities = defaultActivities }: ActiviteRecenteProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">{dict.title}</h2>
                <Link href={`/${locale}/dashboard/admin/journal-audit`} className="text-xs font-semibold text-green-500 hover:text-green-600 transition-colors">
                    {dict.voirTout}
                </Link>
            </div>
            <div className="divide-y divide-gray-50">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 px-5 py-3.5">
                        {iconMap[activity.type]}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700">{activity.title}</p>
                            <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{activity.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
