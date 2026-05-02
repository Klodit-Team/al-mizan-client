"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { type Organisation, type User } from "./types";
import {
  getAdminOrganisationById,
  verifyAdminOrganisation,
} from "@/services/admin/organisations";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const dummyOrg: Organisation = {
    id: "3",
    denomination: "BTP-Plus SPA",
    nif: "111222333444555",
    nis: "11122233344455",
    registre_commerce: "RC-2021-078",
    adresse: "Cité des Annassers, Bt C N°12",
    wilaya: "Alger",
    commune: "Kouba",
    telephone: "+213 21 000 003",
    email: "contact@btpplus.dz",
    type: "ENTREPRISE_PUBLIQUE",
    is_verified: false,
    created_at: "2023-06-20T08:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
};

const dummyUsers: User[] = [
    { id: "u1", username: "Karim Bensalem", email: "k.bensalem@btpplus.dz", role: "SERVICE_CONTRACTANT", organisation_id: "3", created_at: "2023-06-20T08:00:00Z", is_active: true },
    { id: "u2", username: "Sara Hamdi", email: "s.hamdi@btpplus.dz", role: "OPERATEUR_ECONOMIQUE", organisation_id: "3", created_at: "2023-07-01T10:00:00Z", is_active: true },
    { id: "u3", username: "Yacine Drif", email: "y.drif@btpplus.dz", role: "MEMBRE_COMMISSION", organisation_id: "3", created_at: "2023-08-15T09:00:00Z", is_active: false },
];

const roleLabels: Record<string, string> = {
    ADMIN: "Administrateur",
    SERVICE_CONTRACTANT: "Service Contractant",
    OPERATEUR_ECONOMIQUE: "Opérateur Économique",
    MEMBRE_COMMISSION: "Membre Commission",
    CONTROLEUR: "Contrôleur",
};

const typeLabels: Record<string, string> = {
    EPA: "EPA", EPIC: "EPIC", MINISTERE: "Ministère",
    ENTREPRISE_PRIVEE: "Entreprise Privée",
    ENTREPRISE_PUBLIQUE: "Entreprise Publique",
    GROUPEMENT: "Groupement",
};

interface OrganisationDetailPageProps {
    locale: string;
    orgId: string;
    dict: CommonDict['dashboard']['admin']['organisationDetailPage'];
}

export default function OrganisationDetailPage({ locale, orgId, dict }: OrganisationDetailPageProps) {
    const router = useRouter();
    const params = useParams();
    const adminId = params?.adminId || "admin";
    const [org, setOrg] = useState<Organisation>(dummyOrg);
    const [users, setUsers] = useState<User[]>(dummyUsers);
    const [isLoading, setIsLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [showConfirm, setShowConfirm] = useState<"verify" | "reject" | null>(null);

    const handleVerify = async () => {
        setVerifying(true);
        try {
            await verifyAdminOrganisation(orgId);
            setOrg((prev) => ({ ...prev, is_verified: true }));
            setShowConfirm(null);
        } catch (error) {
            console.error("Error verifying organisation:", error);
        } finally {
            setVerifying(false);
        }
    };

    const handleReject = async () => {
        setRejecting(true);
        try {
            // Reject endpoint is not available in the documented list, so keep the current UI behavior until backend provides one.
            await new Promise((r) => setTimeout(r, 800));
            router.push(`/${locale}/dashboard/admin/${adminId}/organisations`);
        } catch (error) {
            console.error("Error rejecting organisation:", error);
        } finally {
            setRejecting(false);
        }
    };

    const fetchOrganisationDetails = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminOrganisationById(orgId);
            setOrg(data.organisation);
            setUsers(Array.isArray(data.users) ? data.users : dummyUsers);
        } catch (error) {
            console.error("Error fetching organisation details:", error);
            setUsers(dummyUsers);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            fetchOrganisationDetails();
        }
    }, [orgId]);

    const initials = org?.denomination?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "";

    return (
        <div className="p-6 space-y-5 max-w-4xl mx-auto">

            {/* Back */}
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {dict.backButton}
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: "#1e2535" }}>
                        {initials}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{org.denomination}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{typeLabels[org.type]}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${org.is_verified ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                                {org.is_verified ? dict.verifiedLabel : dict.pendingLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!org.is_verified && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirm("reject")}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                            {dict.actionReject}
                        </button>
                        <button
                            onClick={() => setShowConfirm("verify")}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: "#4CAF50" }}
                        >
                            {dict.actionVerify}
                        </button>
                    </div>
                )}
                {org.is_verified && (
                    <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {dict.verifiedBadge}
                    </span>
                )}
            </div>

            
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-base font-bold text-gray-800 mb-2">
                            {showConfirm === "verify" ? dict.confirmVerifyTitle : dict.confirmRejectTitle}
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {showConfirm === "verify"
                                ? dict.confirmVerifyText.replace("{denomination}", org.denomination)
                                : dict.confirmRejectText.replace("{denomination}", org.denomination)
                            }
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                {dict.cancelButton}
                            </button>
                            <button
                                onClick={showConfirm === "verify" ? handleVerify : handleReject}
                                disabled={verifying || rejecting}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
                                style={{ backgroundColor: showConfirm === "verify" ? "#4CAF50" : "#ef4444" }}
                            >
                                {verifying || rejecting ? "..." : showConfirm === "verify" ? dict.verifyButton : dict.rejectButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            <div className="grid grid-cols-2 gap-4">
               
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h2 className="text-sm font-bold text-gray-700 mb-3">{dict.legalInfo}</h2>
                    {[
                        { label: dict.labelNIF, value: org.nif },
                        { label: dict.labelNIS, value: org.nis },
                        { label: dict.labelRegister, value: org.registre_commerce },
                        { label: dict.labelType, value: typeLabels[org.type] },
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-400">{item.label}</span>
                            <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Contact info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h2 className="text-sm font-bold text-gray-700 mb-3">{dict.contactInfo}</h2>
                    {[
                        { label: dict.labelEmail, value: org.email },
                        { label: dict.labelTelephone, value: org.telephone || "-" },
                        { label: dict.labelAddress, value: org.adresse },
                        { label: dict.labelLocation, value: `${org.wilaya} / ${org.commune}` },
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0 gap-4">
                            <span className="text-xs text-gray-400 flex-shrink-0">{item.label}</span>
                            <span className="text-xs font-semibold text-gray-700 text-right">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700">{dict.usersTitle} ({users.length})</h2>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.nameHeader}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.emailHeader}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.roleHeader}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.statusHeader}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{dict.createdAtHeader}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1e2535" }}>
                                            {user.username.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-xs text-gray-500">{user.email}</td>
                                <td className="px-5 py-3">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                        {roleLabels[user.role]}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                        {user.is_active ? dict.statusActive : dict.statusInactive}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-xs text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString("fr-DZ")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Meta */}
            <p className="text-xs text-gray-400">
                {dict.registeredMeta
                    .replace("{createdAt}", org.created_at ? new Date(org.created_at).toLocaleDateString("fr-DZ") : "N/A")
                    .replace("{updatedAt}", org.updated_at ? new Date(org.updated_at).toLocaleDateString("fr-DZ") : "N/A")}
            </p>
        </div>
    );
}