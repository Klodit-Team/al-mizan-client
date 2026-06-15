"use client";
import { type Locale } from "@/i18n/config";
import type { AdministratorAiAlert } from "@/services/administrator-dashboard/api";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface AlertesIAProps {
    alertes?: AdministratorAiAlert[];
    dict: CommonDict['dashboard']['admin']['alertesIA'];
    locale: Locale;
}

const severityStyles = {
    high: {
        bg: "bg-red-50",
        border: "border-red-200",
        dot: "bg-red-500",
        text: "text-red-600",
        icon: "text-yellow-500",
        badge: "bg-red-100 text-red-700",
    },
    medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
        text: "text-yellow-600",
        icon: "text-yellow-500",
        badge: "bg-yellow-100 text-yellow-700",
    },
    low: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        dot: "bg-blue-500",
        text: "text-blue-600",
        icon: "text-blue-500",
        badge: "bg-blue-100 text-blue-700",
    },
};

function resolveHref(locale: Locale, href?: string): string {
    if (!href || href === "#") return "#";
    if (href.startsWith("http") || href.startsWith(`/${locale}`)) return href;
    return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

function formatRelativeTime(isoString?: string): string | null {
    if (!isoString) return null;
    try {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "à l'instant";
        if (mins < 60) return `il y a ${mins} min`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `il y a ${hrs}h`;
        return `il y a ${Math.floor(hrs / 24)}j`;
    } catch {
        return null;
    }
}

export default function AlertesIA({ alertes = [], dict, locale }: AlertesIAProps) {
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
                {alertes.length > 0 && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                        {alertes.length}
                    </span>
                )}
            </div>

            <div className="p-3 space-y-3">
                {alertes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <svg className="w-8 h-8 text-green-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-gray-400">Aucune alerte IA active</p>
                    </div>
                ) : (
                    alertes.map((alerte) => {
                        const styles = severityStyles[alerte.severity];
                        const relTime = formatRelativeTime(alerte.emittedAt);
                        return (
                            <div key={alerte.id} className={`rounded-lg p-3 border ${styles.bg} ${styles.border}`}>
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
                                    <span className={`text-xs font-bold ${styles.text}`}>{alerte.title}</span>
                                    {alerte.typeAlerte && (
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${styles.badge}`}>
                                            {alerte.typeAlerte.replace(/_/g, " ")}
                                        </span>
                                    )}
                                    <svg className={`w-3.5 h-3.5 ml-auto flex-shrink-0 ${styles.icon}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-gray-600 leading-snug">{alerte.description}</p>
                                {relTime && (
                                    <p className="text-[10px] text-gray-400 mt-1">{relTime}</p>
                                )}
                                {alerte.actionLabel && (
                                    <a
                                        href={resolveHref(locale, alerte.actionHref)}
                                        className={`text-xs font-semibold mt-2 inline-block ${styles.text} hover:underline`}
                                    >
                                        {alerte.actionLabel} →
                                    </a>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
