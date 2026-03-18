"use client";
import { type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;


interface Alerte {
    id: string;
    severity: "high" | "medium" | "low";
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

interface AlertesIAProps {
    alertes?: Alerte[];
    dict:CommonDict['dashboard']['admin']['alertesIA'];
    locale:Locale;
}

const defaultAlertes: Alerte[] = [
    {
        id: "1",
        severity: "high",
        title: "Divergence Détectée",
        description: "Anomalie détectée dans les prix unitaires de l'offre #LOT-3. Les prix sont 40% inférieurs à la moyenne établie.",
        actionLabel: "Analyser le rapport",
        actionHref: "#",
    },
];

const severityStyles = {
    high: {
        bg: "bg-red-50",
        border: "border-red-200",
        dot: "bg-red-500",
        text: "text-red-600",
        icon: "text-yellow-500",
    },
    medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
        text: "text-yellow-600",
        icon: "text-yellow-500",
    },
    low: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        dot: "bg-blue-500",
        text: "text-blue-600",
        icon: "text-blue-500",
    },
};

export default function AlertesIA({ alertes = defaultAlertes,dict,locale }: AlertesIAProps) {
    return (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#1e2535", borderColor: "#2a3347" }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "#2a3347" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: "#4CAF50" }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>
                <span className="text-sm font-bold text-white tracking-wide">{dict.title}</span>
            </div>

            
            <div className="p-3 space-y-3">
                {alertes.map((alerte) => {
                    const styles = severityStyles[alerte.severity];
                    return (
                        <div key={alerte.id} className={`rounded-lg p-3 border ${styles.bg} ${styles.border}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                                <span className={`text-xs font-bold ${styles.text}`}>{alerte.title}</span>
                                <svg className={`w-3.5 h-3.5 ml-auto ${styles.icon}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <p className="text-xs text-gray-600 leading-snug">{alerte.description}</p>
                            {alerte.actionLabel && (
                                <a href={alerte.actionHref ?? "#"} className={`text-xs font-semibold mt-2 inline-block ${styles.text} hover:underline`}>
                                    {alerte.actionLabel} →
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}