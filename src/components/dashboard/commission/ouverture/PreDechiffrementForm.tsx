"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import type {
  CommissionEvaluation,
  MembreEvaluation,
  SeanceOuverture,
} from "@/services/commission-dashboard/api";
import { useOuvrirPlisMutation } from "@/services/commission-dashboard/queries";

interface SubmissionItem {
  id: string;
  reference: string;
  operatorName: string;
  status: string;
}

interface PreDechiffrementFormProps {
  locale: Locale;
  commissionId: string;
  offreId: string;
  commission: CommissionEvaluation;
  activeMembers: MembreEvaluation[];
  seanceActive: SeanceOuverture | null;
  rows: (SubmissionItem & {
    received: boolean;
    compliant: boolean;
    observations: string;
  })[];
  dict: {
    titleBarLabel: string;
    sessionTitle: string;
    titleBarBadge: string;
    sessionSubTitle: string;
    statusLabel: string;
    membersPresentTitle: string;
    membersPresentSubtitle: string;
    reference: string;
    operator: string;
    received: string;
    compliant: string;
    observations: string;
    processedSummary: string;
    saveDraft: string;
    proceedToDecryption: string;
  };
}

function Badge({ children, active }: { children: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
        active ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      {children}
    </span>
  );
}

export default function PreDechiffrementForm({
  locale,
  commissionId,
  offreId,
  commission,
  activeMembers,
  seanceActive,
  rows,
  dict,
}: PreDechiffrementFormProps) {
  const isAr = locale === "ar";
  const router = useRouter();

  // Initialize all active members as present by default for a smoother UX, but let the user toggle them.
  const [presentMemberIds, setPresentMemberIds] = useState<string[]>(
    seanceActive?.membresPresentsIds ?? activeMembers.map((m) => m.userId)
  );

  const seanceId = seanceActive?.id ?? "";
  const ouvrirPlisMutation = useOuvrirPlisMutation(seanceId);

  const toggleMemberPresence = (userId: string) => {
    setPresentMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const minMembersRequired = commission.nombreMinMembres ?? 3;
  const isQuorumReached = presentMemberIds.length >= minMembersRequired;

  const handleProceed = async () => {
    if (!isQuorumReached || !seanceId) return;

    try {
      await ouvrirPlisMutation.mutateAsync(presentMemberIds);
      // Quorum verified and séance opened! Redirect to decryption page.
      router.push(`/${locale}/dashboard/commission/${commissionId}/mes-commissions/${offreId}`);
    } catch (error) {
      console.error("Failed to open plis:", error);
    }
  };

  return (
    <div className="space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* Header / Title bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-600">{dict.titleBarLabel}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{dict.sessionTitle}</h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">{dict.titleBarBadge}</span>
            {seanceActive && <Badge active={seanceActive.statut !== "PROGRAMMEE"}>{seanceActive.statut}</Badge>}
          </div>
          <p className="text-sm text-slate-500 mt-2.5 font-medium max-w-2xl leading-relaxed">
            {dict.sessionSubTitle
              .replace("{{reference}}", commission.reference)
              .replace("{{objet}}", commission.objet)}
          </p>
        </div>

        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          {dict.statusLabel}
        </div>
      </div>

      {/* Quorum and presence check card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">{dict.membersPresentTitle}</p>
            <p className="text-base font-bold text-slate-950 mt-2">{dict.membersPresentSubtitle}</p>
            
            {/* Quorum status indicator */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isQuorumReached ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span className={`text-xs font-bold ${isQuorumReached ? "text-emerald-700" : "text-rose-600"}`}>
                {isAr
                  ? `النصاب القانوني: ${presentMemberIds.length} / ${minMembersRequired} مطلوب`
                  : `Quorum : ${presentMemberIds.length} présent(s) / ${minMembersRequired} requis`}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 max-w-3xl">
            {activeMembers.length === 0 ? (
              <span className="text-sm text-slate-400 font-semibold">{isAr ? "لا يوجد أعضاء نشطون" : "Aucun membre actif"}</span>
            ) : (
              activeMembers.map((member) => {
                const isPresent = presentMemberIds.includes(member.userId);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMemberPresence(member.userId)}
                    className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold border transition-all duration-300 shadow-sm ${
                      isPresent
                        ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-300 ${
                      isPresent ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                    }`}>
                      {(member.prenom?.[0] ?? "") + (member.nom?.[0] ?? "")}
                    </span>
                    <span className="truncate">{member.prenom} {member.nom}</span>
                    
                    {/* Checkbox dot */}
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                      isPresent ? "bg-emerald-400 border-white" : "bg-white border-slate-300"
                    }`}>
                      {isPresent && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className="text-indigo-950 stroke-current" strokeWidth="4">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Submissions table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
            <p className="text-lg font-semibold text-slate-900">{isAr ? "لا توجد عروض" : "Aucune soumission"}</p>
            <p className="mt-2 text-sm text-slate-500">{isAr ? "لم يتم إرجاع أي عروض لهذا طلب العرض من الخادم." : "Le backend n'a renvoyé aucune soumission pour cet appel d'offres."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-3 font-bold">{dict.reference}</th>
                  <th className="py-3 px-3 font-bold">{dict.operator}</th>
                  <th className="py-3 px-3 font-bold text-center">{dict.received}</th>
                  <th className="py-3 px-3 font-bold text-center">{dict.compliant}</th>
                  <th className="py-3 px-3 font-bold">{dict.observations}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors duration-200">
                    <td className="py-4 px-3 font-bold text-slate-900">{item.reference}</td>
                    <td className="py-4 px-3 font-semibold text-slate-700">{item.operatorName}</td>
                    <td className="py-4 px-3 text-center">
                      <Badge active={item.received}>{item.received ? (isAr ? "نعم" : "Oui") : (isAr ? "لا" : "Non")}</Badge>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <Badge active={item.compliant}>{item.compliant ? (isAr ? "نعم" : "Oui") : (isAr ? "لا" : "Non")}</Badge>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">{item.observations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <p className="text-sm text-slate-500 font-semibold">
          {dict.processedSummary
            .replace("{{treated}}", String(rows.filter((row) => row.received).length))
            .replace("{{total}}", String(rows.length))}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
          >
            {dict.saveDraft}
          </button>
          
          <button
            type="button"
            disabled={!isQuorumReached || ouvrirPlisMutation.isPending}
            onClick={handleProceed}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 shadow-md ${
              isQuorumReached && !ouvrirPlisMutation.isPending
                ? "bg-[#4CAF50] hover:bg-[#43A047] hover:-translate-y-0.5"
                : "bg-slate-300 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {ouvrirPlisMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isAr ? "جارٍ الفتح..." : "Ouverture en cours..."}
              </span>
            ) : (
              dict.proceedToDecryption
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
