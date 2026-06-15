"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
    type AuditLog,
} from "@/services/admin/audit";
import {
    useAuditQuery,
    useIntegrityStatusQuery,
    useVerifyIntegrityMutation
} from "@/services/admin";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const dummyLogs: AuditLog[] = [
    { id: "log-001", user_id: "user-001", action: "LOGIN",          entite: "system",       entite_id: "system",       details: "User logged in",              ip_address: "192.168.1.10", user_agent: "Mozilla/5.0", hash_sha256: "abc123", hash_precedent: "000000", horodatage: "2024-03-10T08:30:00Z" },
    { id: "log-002", user_id: "user-002", action: "UPDATE_AO",      entite: "AppelOffres",  entite_id: "AO-2023-045",  details: "Updated appel d'offres",       ip_address: "192.168.1.15", user_agent: "Mozilla/5.0", hash_sha256: "ghi789", hash_precedent: "abc123", horodatage: "2024-03-10T09:15:00Z" },
    { id: "log-003", user_id: "user-003", action: "CREATE",         entite: "User",         entite_id: "user-new",     details: "Created new user profile",     ip_address: "192.168.1.10", user_agent: "Mozilla/5.0", hash_sha256: "mno345", hash_precedent: "ghi789", horodatage: "2024-03-10T10:05:00Z" },
    { id: "log-004", user_id: "user-004", action: "VIEW_REPORT",    entite: "Report",       entite_id: "report-monthly", details: "Viewed monthly report",      ip_address: "192.168.1.22", user_agent: "Mozilla/5.0", hash_sha256: "stu901", hash_precedent: "mno345", horodatage: "2024-03-11T11:20:00Z" },
    { id: "log-005", user_id: "user-005", action: "UPDATE_SETTINGS", entite: "Settings",    entite_id: "email-config", details: "Updated email configuration",  ip_address: "192.168.1.10", user_agent: "Mozilla/5.0", hash_sha256: "yza567", hash_precedent: "stu901", horodatage: "2024-03-11T14:45:00Z" },
    { id: "log-006", user_id: "user-006", action: "LOGIN",          entite: "system",       entite_id: "system",       details: "User logged in",              ip_address: "192.168.1.34", user_agent: "Mozilla/5.0", hash_sha256: "efg123", hash_precedent: "yza567", horodatage: "2024-03-12T08:00:00Z" },
];

interface AuditLogsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['auditLogsPage'];
}

export default function AuditLogsPage({ locale, dict }: AuditLogsPageProps) {
    const [searchUser, setSearchUser] = useState("");
    const [searchAction, setSearchAction] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const { data: logsResponse, isLoading } = useAuditQuery({
        action: searchAction || undefined,
        dateMin: dateFilter ? `${dateFilter}T00:00:00.000Z` : undefined,
        dateMax: dateFilter ? `${dateFilter}T23:59:59.999Z` : undefined,
        limit: 100,
    });
    const logs = Array.isArray(logsResponse) ? logsResponse : dummyLogs;

    const { data: integrityResult, isError: integrityError } = useIntegrityStatusQuery();
    const { mutateAsync: verifyMutate, isPending: isVerifyingIntegrity } = useVerifyIntegrityMutation();

    const actionOptions = [
        { key: "LOGIN",           label: dict.actions.LOGIN },
        { key: "UPDATE_AO",       label: dict.actions.UPDATE_AO },
        { key: "CREATE_USER",     label: dict.actions.CREATE_USER },
        { key: "DELETE_USER",     label: dict.actions.DELETE_USER },
        { key: "VIEW_REPORT",     label: dict.actions.VIEW_REPORT },
        { key: "EXPORT_DATA",     label: dict.actions.EXPORT_DATA },
        { key: "UPDATE_SETTINGS", label: dict.actions.UPDATE_SETTINGS },
    ];

    const handleVerifyIntegrity = async () => {
        try {
            await verifyMutate();
        } catch (error) {
            console.error("Error verifying audit integrity:", error);
        }
    };

    // Client-side user filter (user_id is the only reliable text field without a name lookup)
    const filteredLogs = useMemo(() => {
        if (!searchUser) return logs;
        const q = searchUser.toLowerCase();
        return logs.filter((log: AuditLog) =>
            log.user_id.toLowerCase().includes(q) ||
            log.entite.toLowerCase().includes(q) ||
            log.details.toLowerCase().includes(q)
        );
    }, [logs, searchUser]);

    const getActionLabel = (actionKey: string) => {
        const option = actionOptions.find(o => o.key === actionKey);
        return option ? option.label : actionKey;
    };

    const integrityIsValid = integrityResult && integrityResult.invalidCount === 0;

    return (
        <div className="p-6 space-y-5">
           
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
                </div>
                <button 
                    onClick={handleVerifyIntegrity}
                    disabled={isVerifyingIntegrity}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {isVerifyingIntegrity ? (
                        <>
                            <svg className="animate-spin w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

            {/* Integrity result banner */}
            {integrityResult && !integrityError && (
                <div className={`p-4 rounded-lg flex items-start gap-3 border ${integrityIsValid ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                    <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${integrityIsValid ? "text-green-600" : "text-red-600"}`} fill="currentColor" viewBox="0 0 20 20">
                        {integrityIsValid
                            ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            : <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        }
                    </svg>
                    <div className="text-sm">
                        <p className="font-medium">
                            {integrityIsValid ? dict.integrityCheck.success : `${integrityResult.invalidCount} entrée(s) invalide(s) détectée(s)`}
                        </p>
                        <p className="text-xs mt-0.5 opacity-75">
                            {integrityResult.checkedCount} entrées vérifiées · {new Date(integrityResult.checkedAt).toLocaleString(locale)}
                        </p>
                    </div>
                </div>
            )}
            {integrityError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
                    Erreur lors de la vérification d&apos;intégrité.
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Search by user ID / entity */}
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
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
                </div>

                {/* Filter by action */}
                <div className="flex-1 min-w-[200px]">
                    <select
                        value={searchAction}
                        onChange={(e) => setSearchAction(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
                    >
                        <option value="">{dict.searchActionPlaceholder}</option>
                        {actionOptions.map(opt => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Filter by date */}
                <div className="flex-1 min-w-[150px]">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-gray-700"
                        title={dict.dateFilterPlaceholder}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">{dict.columns.user}</th>
                                <th className="px-6 py-4">{dict.columns.action}</th>
                                <th className="px-6 py-4">Entité</th>
                                <th className="px-6 py-4">Détails</th>
                                <th className="px-6 py-4">{dict.columns.ipAddress}</th>
                                <th className="px-6 py-4">{dict.columns.date}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
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
                                filteredLogs.map((log: AuditLog) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-700">{log.user_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {getActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium">{log.entite}</div>
                                            <div className="text-xs text-gray-400 font-mono">{log.entite_id}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[260px] truncate" title={log.details}>
                                            <span className="text-xs text-gray-500">{log.details}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs">{log.ip_address}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(log.horodatage).toLocaleString(locale)}
                                        </td>
                                    </tr>
                                ))
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
