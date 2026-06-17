"use client";

import { useState } from "react";
import Link from "next/link";
import type { SoumissionRetenue } from "./types";
import {
  useSeancesOuvertureQuery,
  useDemarrerSeanceMutation,
  useTerminerSeanceMutation,
  useGeneratePVMutation,
  useResultatsOuvertureQuery,
} from "@/services/commission-dashboard/queries";
import { downloadPV } from "@/services/commission-dashboard/api";

interface OffreDechiffrementPageProps {
  locale: string;
  offreId: string;
  dict: {
    roleHint: string;
    pageTitle: string;
    pageSubTitle: string;
    infoBanner: string;
    cardTitle: string;
    cardDescription: string;
    steps: string[];
    unlockButton: string;
    unlocking: string;
    unlocked: string;
    waitingPresident: string;
    waitingMembers: string;
    retainedSubmissionsTitle: string;
    retainedBadge: string;
    tableSoumissionnaire: string;
    tableScoreTechnique: string;
    tableMontantFinancier: string;
    waitingDecryption: string;
    waitingDecryptionDescription: string;
    proceedToDeliberation: string;
    downloadPV: string;
  };
}

function formatMoney(amount: number, isAr: boolean) {
  return new Intl.NumberFormat(isAr ? "ar-DZ" : "fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── État vide : aucune séance trouvée ─────────────────────────────────────────
function NoSeanceState({ isAr }: { isAr: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">
          {isAr ? "لا توجد جلسة نشطة" : "Aucune séance active"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {isAr
            ? "لم يتم برمجة جلسة فتح الأظرفة لهذا الطلب بعد"
            : "Aucune séance d'ouverture n'a encore été programmée pour cet appel d'offre"}
        </p>
      </div>
    </div>
  );
}

// ── Tableau des soumissions (données live ou vide) ────────────────────────────
function SoumissionsTable({
  soumissions,
  isFullyUnlocked,
  isAr,
  dict,
}: {
  soumissions: SoumissionRetenue[];
  isFullyUnlocked: boolean;
  isAr: boolean;
  dict: OffreDechiffrementPageProps["dict"];
}) {
  if (soumissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-slate-400">
          {isAr ? "لا توجد عروض بعد" : "Aucune soumission disponible"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <table
        className={`w-full ${
          !isFullyUnlocked
            ? "filter blur-sm select-none opacity-40 transition-all duration-700"
            : "transition-all duration-700"
        }`}
      >
        <thead>
          <tr className="border-b border-gray-100 text-left text-sm font-semibold text-gray-400">
            <th className="pb-3 px-3">{dict.tableSoumissionnaire}</th>
            <th className="pb-3 px-3 text-center">{dict.tableScoreTechnique}</th>
            <th className="pb-3 px-3 text-right">{dict.tableMontantFinancier}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {soumissions.map((s) => (
            <tr key={s.id} className="text-sm font-medium">
              <td className="py-4 px-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {s.soumissionnaire.acronyme ?? s.soumissionnaire.nom.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-gray-800">{s.soumissionnaire.nom}</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <span className="text-gray-600">
                  {s.scoreTechnique != null ? `${s.scoreTechnique} / 100` : "—"}
                </span>
              </td>
              <td className="py-4 px-3 text-right">
                {isFullyUnlocked ? (
                  <span className="text-gray-900 font-bold">
                    {s.montantFinancier != null ? formatMoney(s.montantFinancier, isAr) : "—"}
                  </span>
                ) : (
                  <span className="text-gray-300 tracking-widest text-lg font-mono">
                    * * *  * * * , * *
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isFullyUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8 max-w-sm text-center transform -translate-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-gray-800 font-bold text-lg mb-2">{dict.waitingDecryption}</h4>
            <p className="text-sm text-gray-500">{dict.waitingDecryptionDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OffreDechiffrementPage({
  locale,
  offreId,
  dict,
}: OffreDechiffrementPageProps) {
  const isAr = locale === "ar";

  // ── Données live ────────────────────────────────────────────────────────────
  const { data: seances, isLoading: loadingSeances } = useSeancesOuvertureQuery();
  const seanceActive = seances?.find((s) => s.appelOffreId === offreId);
  const seanceId = seanceActive?.id ?? "";

  const demarrerMutation = useDemarrerSeanceMutation(seanceId);
  const terminerMutation = useTerminerSeanceMutation(seanceId);
  const generatePVMutation = useGeneratePVMutation(seanceId);
  const { data: resultats } = useResultatsOuvertureQuery(seanceId);

  // Soumissions extraites des résultats live (quand la séance existe)
  const soumissionsLive: SoumissionRetenue[] = (resultats ?? []).map((r) => ({
    id: r.soumissionId,
    soumissionnaire: { nom: r.soumissionId, acronyme: r.soumissionId.slice(0, 2).toUpperCase() },
    scoreTechnique: null,
    montantFinancier: r.montantFinancier ?? null,
  }));

  // Statut backend → nb clés débloquées
  const backendKeysUnlocked =
    seanceActive?.statut === "TERMINEE" ? 3 :
    seanceActive?.statut === "EN_COURS" ? 2 : 0;

  // ── UI state ────────────────────────────────────────────────────────────────
  const [isUnlocking, setIsUnlocking] = useState(false);

  const keysUnlocked = backendKeysUnlocked;
  const isFullyUnlocked = keysUnlocked >= 3;
  const canStart = seanceActive?.statut === "PROGRAMMEE";
  const canFinish = seanceActive?.statut === "EN_COURS";
  const canUnlock = canStart || canFinish;

  const handleUnlockClick = async () => {
    setIsUnlocking(true);
    try {
      if (canStart) {
        await demarrerMutation.mutateAsync();
      } else if (canFinish) {
        await terminerMutation.mutateAsync();
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDownloadPV = async () => {
    if (!seanceId) return;
    if (seanceActive?.pvUrl) { window.open(seanceActive.pvUrl, "_blank"); return; }
    await generatePVMutation.mutateAsync().catch(() => null);
    await downloadPV(seanceId);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadingSeances) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="h-10 w-64 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>

      {/* Session status banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm">
        <span className="text-sm font-medium text-yellow-800">
          🔧 {dict.roleHint}
        </span>
        {seanceActive && (
          <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
            [{seanceActive.statut}]
          </span>
        )}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{dict.pageTitle}</h1>
        {seanceActive ? (
          <p className="text-gray-500 mt-1 font-medium">
            {dict.pageSubTitle
              .replace("{{reference}}", seanceActive.appelOffreId)
              .replace("{{objet}}", seanceActive.appelOffreId)}
          </p>
        ) : (
          <p className="text-gray-400 mt-1 text-sm">
            {isAr ? `رقم الطلب: ${offreId}` : `Appel d'offre : ${offreId}`}
          </p>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-800 font-medium">{dict.infoBanner}</p>
      </div>

      {/* Pas de séance */}
      {!seanceActive ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <NoSeanceState isAr={isAr} />
        </div>
      ) : (
        <>
          {/* Dark unlock card */}
          <div className="bg-[#2D333B] rounded-2xl p-8 shadow-lg text-center relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isFullyUnlocked
                    ? "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"}
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{dict.cardTitle}</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-10">{dict.cardDescription}</p>

            {/* Steps */}
            <div className="flex items-center justify-center gap-2 mb-10 text-xs font-semibold">
              {dict.steps.map((label, idx, arr) => {
                const thresholds = [1, 2, 3];
                const done = keysUnlocked >= thresholds[idx];
                const connectorDone = idx < arr.length - 1 && keysUnlocked >= thresholds[idx + 1];
                return (
                  <div key={idx} className="flex items-center">
                    <div className="flex flex-col items-center relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${done ? "bg-emerald-500 text-white" : "bg-[#1E2329] border-2 border-gray-600 text-gray-500"}`}>
                        {done ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        )}
                      </div>
                      <span className={`absolute -bottom-6 whitespace-nowrap ${done ? "text-emerald-400" : "text-gray-500"}`}>{label}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 transition-colors duration-500 ${connectorDone ? "bg-emerald-500" : "bg-gray-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={handleUnlockClick}
                disabled={!canUnlock || isUnlocking || isFullyUnlocked}
                className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                  isFullyUnlocked
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                    : canUnlock && !isUnlocking
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {!isFullyUnlocked && (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
                {isUnlocking
                  ? dict.unlocking
                  : isFullyUnlocked
                    ? dict.unlocked
                    : canStart
                      ? "Démarrer la séance"
                      : "Terminer la séance"}
              </button>
              {!canUnlock && !isFullyUnlocked && (
                <p className="text-xs text-red-400 mt-3 font-medium">
                  {isAr ? "Cette séance n'est pas encore disponible." : "Cette séance n'est pas encore disponible."}
                </p>
              )}
            </div>
          </div>

          {/* Soumissions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">{dict.retainedSubmissionsTitle}</h3>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                {dict.retainedBadge}
              </span>
            </div>
            <SoumissionsTable
              soumissions={soumissionsLive}
              isFullyUnlocked={isFullyUnlocked}
              isAr={isAr}
              dict={dict}
            />
          </div>

          {/* Footer actions */}
          {isFullyUnlocked && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleDownloadPV}
                disabled={generatePVMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V19a2 2 0 002 2h14a2 2 0 002-2v-2" />
                </svg>
                {generatePVMutation.isPending ? (isAr ? "جارٍ التوليد…" : "Génération…") : dict.downloadPV}
              </button>

              <Link
                href={`/${locale}/dashboard/commission/evaluations/${offreId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-bold hover:bg-[#43A047] transition-all shadow-md hover:-translate-y-0.5"
              >
                {dict.proceedToDeliberation}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
