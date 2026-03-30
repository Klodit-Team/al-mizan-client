"use client";

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface StatsCardsProps {
    stats: {
        utilisateursActifs: number;
        aoEnCours: number;
        recoursOuverts: number;
        incidentsIA: number;
    };
    dict: CommonDict['dashboard']['admin']['stats'];
    
}

export default function StatsCards({ stats, dict  }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-4 gap-4">

            {/* Utilisateurs actifs */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-500">{dict.utilisateursActifsBadge}</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{dict.utilisateursActifs}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.utilisateursActifs}</p>
            </div>

            {/* AOs en cours */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold text-blue-400">{dict.aoEnCoursBadge}</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{dict.aoEnCours}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.aoEnCours}</p>
            </div>

            {/* Recours ouverts */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold text-yellow-500">{dict.recoursOuvertsBadge}</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{dict.recoursOuverts}</p>
                <p className="text-3xl font-bold text-gray-800">0{stats.recoursOuverts}</p>
            </div>

            {/* Incidents IA */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold text-red-500">{dict.incidentsIABadge}</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{dict.incidentsIA}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.incidentsIA}</p>
            </div>
        </div>
    );
}