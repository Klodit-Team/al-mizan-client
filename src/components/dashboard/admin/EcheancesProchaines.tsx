"use client";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;



interface Echeance {
    id: string;
    type: "depot" | "commission" | "expiration";
    title: string;
    subtitle: string;
    time: string;
}

interface EcheancesProchainesProps {
    locale: Locale;
    dict:CommonDict['dashboard']['admin']['echeances'];
    echeances?: Echeance[];
}

const defaultEcheances: Echeance[] = [
    {
        id: "1",
        type: "depot",
        title: "Fin de dépôt des plis",
        subtitle: "AO #2023-050 · Demain 10:00",
        time: "Demain",
    },
    {
        id: "2",
        type: "commission",
        title: "Réunion Commission Technique",
        subtitle: "Salle 4b · Après-demain 14:00",
        time: "J+2",
    },
    {
        id: "3",
        type: "expiration",
        title: "Expiration délai recours",
        subtitle: "Marché #2023-041 · Demain 23:59",
        time: "Demain",
    },
];

const typeStyles = {
    depot: "bg-red-500",
    commission: "bg-blue-500",
    expiration: "bg-orange-400",
};

export default function EcheancesProchaines({ locale,dict, echeances = defaultEcheances }: EcheancesProchainesProps) {
    return (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#1e2535", borderColor: "#2a3347" }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "#2a3347" }}>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold text-white">{dict.title}</span>
            </div>

            {/* Items */}
            <div className="p-3 space-y-2">
                {echeances.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 px-1">
                        <div className={`w-1 h-full min-h-[32px] rounded-full mt-1 ${typeStyles[e.type]}`} style={{ width: "3px" }} />
                        <div>
                            <p className="text-xs font-semibold text-white">{e.title}</p>
                            <p className="text-xs text-gray-400">{e.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t" style={{ borderColor: "#2a3347" }}>
                <Link href={`/${locale}/dashboard/contractant/calendar`} className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">
                    Ouvrir le calendrier complet →
                </Link>
            </div>
        </div>
    );
}