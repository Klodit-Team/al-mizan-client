"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { getAdminAuditLogs, verifyAdminAuditIntegrity } from "@/services/admin/audit";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface AuditLog {
    id?: string;
    user_id: string;
    action: string;
    entite?: string;
    entity?: string;
    entite_id?: string;
    entity_id?: string;
    ip_address?: string;
    horodatage?: string;
    hash_sha256?: string;
    agentName?: string;
    // enriched optional fields
    user?: string;
    role?: string;
    date?: string;
}

const AI_ACTIONS = [
    "OCR_NLP_CONFORMITY",
    "ANOMALY_DETECTION",
    "EVALUATION_SCORING",
    "CDC_DRAFT",
    "GRE_A_GRE_SCORING",
] as const;

const HUMAN_ACTIONS = [
    "LOGIN",
    "UPDATE_AO",
    "CREATE_USER",
    "DELETE_USER",
    "VIEW_REPORT",
    "EXPORT_DATA",
    "UPDATE_SETTINGS",
] as const;

const AI_ACTION_SET = new Set<string>(AI_ACTIONS);

const AI_ACTION_LABELS: Record<string, string> = {
    OCR_NLP_CONFORMITY: "OCR / NLP",
    ANOMALY_DETECTION: "Anomalies",
    EVALUATION_SCORING: "Scoring IA",
    CDC_DRAFT: "CDC IA",
    GRE_A_GRE_SCORING: "Score Gré-à-Gré",
};

const HUMAN_ACTION_LABELS: Record<string, string> = {
    LOGIN: "Connexion",
    UPDATE_AO: "Màj AO",
    CREATE_USER: "Créer utilisateur",
    DELETE_USER: "Suppr. utilisateur",
    VIEW_REPORT: "Voir rapport",
    EXPORT_DATA: "Export données",
    UPDATE_SETTINGS: "Paramètres",
};

function getActionLabel(action: string): string {
    return AI_ACTION_LABELS[action] ?? HUMAN_ACTION_LABELS[action] ?? action;
}

interface AuditLogsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['auditLogsPage'];
}

export default function AuditLogsPage({ locale, dict }: AuditLogsPageProps) {
    const [searchUser, setSearchUser] = useState("");
    const [searchAction, setSearchAction] = useState("");
    const [agentFilter, setAgentFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
    const [integrityResult, setIntegrityResult] = useState<boolean | null>(null);

    const allActions = [...HUMAN_ACTIONS, ...AI_ACTIONS] as string[];

    const uniqueAgents = useMemo(() => {
        const set = new Set<string>();
        logs.forEach((l) => { if (l.agentName) set.add(l.agentName); });
        return Array.from(set).sort();
    }, [logs]);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminAuditLogs();
            const arr = Array.isArray(data) ? data : (data as any)?.data ?? [];
            setLogs(arr);
        } catch {
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyIntegrity = async () => {
        setIsVerifyingIntegrity(true);
        setIntegrityResult(null);
        try {
            const result = await verifyAdminAuditIntegrity();
            setIntegrityResult(Boolean(result.valid));
        } catch {
            setIntegrityResult(false);
        } finally {
            setIsVerifyingIntegrity(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchUser =
                (log.user ?? log.user_id ?? "").toLowerCase().includes(searchUser.toLowerCase());
            const matchAction = searchAction === "" || log.action === searchAction;
            const matchAgent = agentFilter === "" || log.agentName === agentFilter;
            const logDate = log.date ?? log.horodatage ?? "";
            const matchDate = dateFilter === "" || logDate.startsWith(dateFilter);
            return matchUser && matchAction && matchAgent && matchDate;
        });
    }, [logs, searchUser, searchAction, agentFilter, dateFilter]);

    const isAiLog = (log: AuditLog) => AI_ACTION_SET.has(log.action) || Boolean(log.agentName);

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
                </div>
                <div className="relative group">
                    <button
                        onClick={handleVerifyIntegrity}
                        disabled={isVerifyingIntegrity}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        title={dict.integrityCheck.button}
                    >
                        {isVerifyingIntegrity ? (
                            <>
                                <svg className="animate-spin w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {dict.integrityCheck.verifying}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                {dict.integrityCheck.button}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {integrityResult === true && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{dict.integrityCheck.success}</span>
                </div>
            )}
            {integrityResult === false && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Altération détectée dans la chaîne de logs.</span>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex-1 min-w-48 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder={dict.searchUserPlaceholder}
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50]"
                    />
                </div>
                <select
                    value={searchAction}
                    onChange={(e) => setSearchAction(e.target.value)}
                    className="flex-1 min-w-44 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                >
                    <option value="">{dict.searchActionPlaceholder}</option>
                    <optgroup label="Actions humaines">
                        {HUMAN_ACTIONS.map((a) => <option key={a} value={a}>{HUMAN_ACTION_LABELS[a]}</option>)}
                    </optgroup>
                    <optgroup label="Actions Agent IA">
                        {AI_ACTIONS.map((a) => <option key={a} value={a}>{AI_ACTION_LABELS[a]}</option>)}
                    </optgroup>
                </select>
                {uniqueAgents.length > 0 && (
                    <select
                        value={agentFilter}
                        onChange={(e) => setAgentFilter(e.target.value)}
                        className="flex-1 min-w-44 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                    >
                        <option value="">Tous les agents IA</option>
                        {uniqueAgents.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                )}
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 min-w-36 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-gray-700"
                    title={dict.dateFilterPlaceholder}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-5 py-4">Utilisateur</th>
                                <th className="px-5 py-4">Action</th>
                                <th className="px-5 py-4">Agent IA</th>
                                <th className="px-5 py-4">Entité</th>
                                <th className="px-5 py-4">IP</th>
                                <th className="px-5 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Chargement…</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            {dict.noLogs}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, i) => {
                                    const ai = isAiLog(log);
                                    const dateStr = log.date ?? log.horodatage ?? "";
                                    const entityStr = log.entite ?? log.entity ?? "";
                                    const entityId = log.entite_id ?? log.entity_id ?? "";
                                    return (
                                        <tr key={(log.id ?? log.user_id) + i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-900">{log.user || log.user_id}</div>
                                                {log.role && <div className="text-xs text-gray-400">{log.role}</div>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ai ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                                                        {getActionLabel(log.action)}
                                                    </span>
                                                    {ai && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                                            IA
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500">
                                                {log.agentName ?? "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm">{entityStr}</div>
                                                <div className="text-xs text-gray-400">{entityId}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs">{log.ip_address ?? "—"}</span>
                                            </td>
                                            <td className="px-5 py-4 text-xs">
                                                {dateStr ? new Date(dateStr).toLocaleString(locale) : "N/A"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!isLoading && (
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <p>{dict.displayingCount.replace("{{filtered}}", filteredLogs.length.toString()).replace("{{total}}", logs.length.toString())}</p>
                </div>
            )}
        </div>
    );
}
