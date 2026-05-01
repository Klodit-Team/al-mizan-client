"use client";
import { useState, useMemo, useEffect } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { getAdminAuditLogs, verifyAdminAuditIntegrity } from "@/services/admin/audit";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface AuditLog {
    user_id: string;
    action: string;
    entity: string;
    entity_id: string;
    ip_address: string;
    hash_sha256: string;
    hash_precedent: string;
    // Optional enriched fields
    user?: string;
    role?: string;
    target?: string;
    date?: string;
}

const dummyLogs: AuditLog[] = [
    { user_id: "user-001", action: "LOGIN", entity: "system", entity_id: "system", ip_address: "192.168.1.10", hash_sha256: "abc123", hash_precedent: "def456", user: "Ahmed Mansour", role: "ADMIN", target: "System", date: "2024-03-10T08:30:00Z" },
    { user_id: "user-002", action: "UPDATE_AO", entity: "appel_offre", entity_id: "AO-2023-045", ip_address: "192.168.1.15", hash_sha256: "ghi789", hash_precedent: "jkl012", user: "Karim Ziani", role: "SERVICE_CONTRACTANT", target: "AO #2023-045", date: "2024-03-10T09:15:00Z" },
    { user_id: "user-003", action: "CREATE_USER", entity: "user", entity_id: "user-new", ip_address: "192.168.1.10", hash_sha256: "mno345", hash_precedent: "pqr678", user: "Ahmed Mansour", role: "ADMIN", target: "Nouveau membre", date: "2024-03-10T10:05:00Z" },
    { user_id: "user-004", action: "VIEW_REPORT", entity: "report", entity_id: "report-monthly", ip_address: "192.168.1.22", hash_sha256: "stu901", hash_precedent: "vwx234", user: "Fatima Benali", role: "CONTROLEUR", target: "Rapport Mensuel", date: "2024-03-11T11:20:00Z" },
    { user_id: "user-005", action: "UPDATE_SETTINGS", entity: "settings", entity_id: "email-config", ip_address: "192.168.1.10", hash_sha256: "yza567", hash_precedent: "bcd890", user: "Ahmed Mansour", role: "ADMIN", target: "Configuration Email", date: "2024-03-11T14:45:00Z" },
    { user_id: "user-006", action: "LOGIN", entity: "system", entity_id: "system", ip_address: "192.168.1.34", hash_sha256: "efg123", hash_precedent: "hij456", user: "Tarek Yahia", role: "MEMBRE_COMMISSION", target: "System", date: "2024-03-12T08:00:00Z" }
];

interface AuditLogsPageProps {
    locale: string;
    dict: CommonDict['dashboard']['admin']['auditLogsPage'];
}

export default function AuditLogsPage({ locale, dict }: AuditLogsPageProps) {
    const [searchUser, setSearchUser] = useState("");
    const [searchAction, setSearchAction] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
    const [integrityValid, setIntegrityValid] = useState<boolean | null>(null);

    const actionOptions = [
        { key: "LOGIN", label: dict.actions.LOGIN },
        { key: "UPDATE_AO", label: dict.actions.UPDATE_AO },
        { key: "CREATE_USER", label: dict.actions.CREATE_USER },
        { key: "DELETE_USER", label: dict.actions.DELETE_USER },
        { key: "VIEW_REPORT", label: dict.actions.VIEW_REPORT },
        { key: "EXPORT_DATA", label: dict.actions.EXPORT_DATA },
        { key: "UPDATE_SETTINGS", label: dict.actions.UPDATE_SETTINGS },
    ];

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminAuditLogs();
            setLogs(Array.isArray(data) ? data : dummyLogs);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            setLogs(dummyLogs);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyIntegrity = async () => {
        setIsVerifyingIntegrity(true);
        setIntegrityValid(null);

        try {
            const data = await verifyAdminAuditIntegrity();
            setIntegrityValid(Boolean(data.valid));
        } catch (error) {
            console.error("Error verifying audit integrity:", error);
            setIntegrityValid(false);
        } finally {
            setIsVerifyingIntegrity(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchUser = log.user?.toLowerCase().includes(searchUser.toLowerCase()) ||
                             log.user_id?.toLowerCase().includes(searchUser.toLowerCase()) || false;
            const matchAction = searchAction === "" || log.action === searchAction;
            
            // Basic date check (if dateFilter is yyyy-mm-dd)
            const matchDate = dateFilter === "" || (log.date && log.date.startsWith(dateFilter));

            return matchUser && matchAction && matchDate;
        });
    }, [logs, searchUser, searchAction, dateFilter]);

    const getActionLabel = (actionKey: string) => {
        const option = actionOptions.find(o => o.key === actionKey);
        return option ? option.label : actionKey;
    };

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

            {integrityValid && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{dict.integrityCheck.success}</span>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Search By User */}
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

                {/* Filter By Action */}
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

                {/* Filter By Date */}
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
                                <th className="px-6 py-4">{dict.columns.ipAddress}</th>
                                <th className="px-6 py-4">{dict.columns.date}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            {dict.noLogs}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.user_id + log.action + log.entity_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{log.user || log.user_id}</div>
                                            {log.role && <div className="text-xs text-gray-400">{log.role}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {getActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">{log.entity}</div>
                                            <div className="text-xs text-gray-400">{log.entity_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs">{log.ip_address}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.date ? new Date(log.date).toLocaleString(locale) : 'N/A'}
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
