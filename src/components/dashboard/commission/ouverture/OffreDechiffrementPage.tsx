"use client";

import { useState } from "react";
import Link from "next/link";
import type { SoumissionRetenue, CommissionRole, OuverturePlisSelectedAO } from "./types";

interface OffreDechiffrementPageProps {
    locale: string;
    offreId: string;
    userId: string;
}

const MOCK_AO: OuverturePlisSelectedAO = {
    id: "ao-001",
    reference: "AO-2023-089",
    objet: "Acquisition Matériel IT"
};

const MOCK_SOUMISSIONS: SoumissionRetenue[] = [
    {
        id: "s-1",
        soumissionnaire: { nom: "TechSolutions SA", acronyme: "TS" },
        scoreTechnique: 85,
        montantFinancier: 145000000,
    },
    {
        id: "s-2",
        soumissionnaire: { nom: "Global IT Services", acronyme: "GI" },
        scoreTechnique: 78,
        montantFinancier: 152500000,
    },
    {
        id: "s-3",
        soumissionnaire: { nom: "Systèmes Avancés", acronyme: "SA" },
        scoreTechnique: 82,
        montantFinancier: 148200000,
    },
];

export default function OffreDechiffrementPage({ locale, offreId, userId }: OffreDechiffrementPageProps) {
    // ── Simulation State ────────────────────────────────────────────────────────
    // We toggle this for UI testing. In prod this would come from the auth token/session.
    const [simulatedRole, setSimulatedRole] = useState<CommissionRole>("membre");

    // keysUnlocked: 0 = start, 1 = first member, 2 = second member, 3 = president unlocks all
    const [keysUnlocked, setKeysUnlocked] = useState<number>(0);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const isFullyUnlocked = keysUnlocked >= 3;

    const handleUnlockClick = async () => {
        setIsUnlocking(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (simulatedRole === "membre" && keysUnlocked < 2) {
            setKeysUnlocked(prev => prev + 1);
        } else if (simulatedRole === "president" && keysUnlocked === 2) {
            setKeysUnlocked(3);
        }

        setIsUnlocking(false);
    };

    // Determine button state based on role and progress
    const canUnlock =
        (simulatedRole === "membre" && keysUnlocked < 2) ||
        (simulatedRole === "president" && keysUnlocked === 2);

    const buttonLabel = isUnlocking
        ? "Déverrouillage en cours..."
        : isFullyUnlocked
            ? "Offres Déverrouillées"
            : "Déverrouiller les Offres";

    // Format money
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
            style: "currency",
            currency: "DZD",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* ── Test Toggle (Development only) ── */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium text-yellow-800">
                    🔧 Mode Test: Simulez votre rôle pour avancer dans le flux
                </span>
                <div className="flex bg-white rounded-lg p-0.5 border border-yellow-200 shadow-sm">
                    <button
                        onClick={() => setSimulatedRole("membre")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${simulatedRole === "membre" ? "bg-yellow-100 text-yellow-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Membre
                    </button>
                    <button
                        onClick={() => setSimulatedRole("president")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${simulatedRole === "president" ? "bg-yellow-100 text-yellow-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Président
                    </button>
                </div>
            </div>

            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Ouverture des Plis : Offre Financière</h1>
                <p className="text-gray-500 mt-1 font-medium">{MOCK_AO.reference} - {MOCK_AO.objet}</p>
            </div>

            {/* ── Info Banner ── */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800 font-medium">
                    Seules les soumissions ayant passé l'évaluation technique sont listées ici.
                </p>
            </div>

            {/* ── Decryption Card ── */}
            <div className="bg-[#2D333B] rounded-2xl p-8 shadow-lg text-center relative overflow-hidden">

                {/* Lock icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
                    {isFullyUnlocked ? (
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    )}
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Déchiffrement des Offres Financières</h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-10">
                    Le processus requiert la validation des membres de la commission. 3 clés sur 5 sont nécessaires pour déverrouiller les montants.
                </p>

                {/* Progress Frise */}
                <div className="flex items-center justify-center gap-2 mb-10 text-xs font-semibold">
                    {[
                        { label: "Membre 1", state: keysUnlocked >= 1 ? "done" : "pending" },
                        { label: "Membre 2", state: keysUnlocked >= 2 ? "done" : "pending" },
                        { label: "Président", state: keysUnlocked >= 3 ? "done" : "pending" },
                        { label: "Membre 4", state: "pending" },
                        { label: "Membre 5", state: "pending" },
                    ].map((step, idx, arr) => (
                        <div key={idx} className="flex items-center">
                            <div className="flex flex-col items-center relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors duration-500
                                    ${step.state === "done" ? "bg-emerald-500 text-white" : "bg-[#1E2329] border-2 border-gray-600 text-gray-500"}`}
                                >
                                    {step.state === "done" ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`absolute -bottom-6 whitespace-nowrap ${step.state === "done" ? "text-emerald-400" : "text-gray-500"}`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Lines between circles */}
                            {idx < arr.length - 1 && (
                                <div className={`w-12 h-0.5 mx-2 transition-colors duration-500 ${arr[idx + 1].state === "done" ? "bg-emerald-500" : "bg-gray-700"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Unlock Action */}
                <div className="pt-4">
                    <button
                        onClick={handleUnlockClick}
                        disabled={!canUnlock || isUnlocking || isFullyUnlocked}
                        className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300
                            ${isFullyUnlocked ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                : canUnlock && !isUnlocking ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
                                    : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                    >
                        {!isFullyUnlocked && (
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        )}
                        {buttonLabel}
                    </button>
                    {!canUnlock && !isFullyUnlocked && (
                        <p className="text-xs text-red-400 mt-3 font-medium">
                            {simulatedRole === "membre" && keysUnlocked >= 2 ? "Vous avez déjà validé. En attente du Président." :
                                simulatedRole === "president" && keysUnlocked < 2 ? "En attente des validations des membres d'abord." : ""}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Table Section ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Soumissions Retenues</h3>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                        3 offres techniquement qualifiées
                    </span>
                </div>

                <div className="relative">
                    {/* The table itself */}
                    <table className={`w-full ${!isFullyUnlocked ? "filter blur-sm select-none opacity-40 transition-all duration-700" : "transition-all duration-700"}`}>
                        <thead>
                            <tr className="border-b border-gray-100 text-left text-sm font-semibold text-gray-400">
                                <th className="pb-3 px-3">Soumissionnaire</th>
                                <th className="pb-3 px-3 text-center">Score Technique</th>
                                <th className="pb-3 px-3 text-right">Montant Financier (DZD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_SOUMISSIONS.map(s => (
                                <tr key={s.id} className="text-sm font-medium">
                                    <td className="py-4 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                {s.soumissionnaire.acronyme}
                                            </div>
                                            <span className="text-gray-800">{s.soumissionnaire.nom}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-3 text-center">
                                        <span className="text-gray-600">{s.scoreTechnique} / 100</span>
                                    </td>
                                    <td className="py-4 px-3 text-right">
                                        {isFullyUnlocked ? (
                                            <span className="text-gray-900 font-bold">{formatMoney(s.montantFinancier!)}</span>
                                        ) : (
                                            <span className="text-gray-300 tracking-widest text-lg font-mono">* * *  * * * , * *</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mask Overlay when NOT unlocked */}
                    {!isFullyUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8 max-w-sm text-center transform -translate-y-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h4 className="text-gray-800 font-bold text-lg mb-2">En attente de déchiffrement...</h4>
                                <p className="text-sm text-gray-500">
                                    Les données financières sont masquées pour préserver la confidentialité jusqu'au déblocage par la commission.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Final Navigation (Visible when fully unlocked) ── */}
            {isFullyUnlocked && (
                <div className="flex justify-end pt-4">
                    <Link
                        href={`/${locale}/dashboard/commission/${userId}/mes-commissions/${offreId}/evaluation`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-bold hover:bg-[#43A047] transition-all shadow-md hover:-translate-y-0.5"
                    >
                        Procéder à la Délibération
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}
