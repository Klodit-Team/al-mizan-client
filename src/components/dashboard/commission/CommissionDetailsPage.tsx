"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useCommissionEvaluationQuery,
  useMembresEvaluationQuery,
  useCommissionMarcheQuery,
  useMembersMarcheQuery,
} from "@/services/commission-dashboard/queries";
import type { CommissionEvaluation, MembreEvaluation, CommissionMarche, MembreMarche } from "@/services/commission-dashboard/api";

interface Props {
  locale: string;
  commissionId: string;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type CommissionType = "evaluation" | "marche";
type Member = MembreEvaluation | MembreMarche;

// ── Status mapping ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  evaluation: {
    BROUILLON: { label: "Brouillon", bg: "#F1F5F9", color: "#64748B" },
    ACTIVE: { label: "Active", bg: "rgba(76,175,80,0.1)", color: "#2e7d32" },
    CLOTUREE: { label: "Clôturée", bg: "#F1F5F9", color: "#475569" },
    ANNULEE: { label: "Annulée", bg: "rgba(239,68,68,0.08)", color: "#dc2626" },
  },
  marche: {
    EN_COURS: { label: "En cours", bg: "rgba(76,175,80,0.1)", color: "#2e7d32" },
    DELIBERATION: { label: "Délibération", bg: "rgba(234,179,8,0.1)", color: "#92400e" },
    ATTRIBUEE: { label: "Attribuée", bg: "rgba(76,175,80,0.1)", color: "#2e7d32" },
    ANNULEE: { label: "Annulée", bg: "rgba(239,68,68,0.08)", color: "#dc2626" },
    INFRUCTUEUSE: { label: "Infructueuse", bg: "rgba(239,68,68,0.08)", color: "#dc2626" },
  },
};

const ROLE_COLORS = {
  PRESIDENT: { bg: "rgba(76,175,80,0.1)", color: "#2e7d32" },
  RAPPORTEUR: { bg: "rgba(59,130,246,0.1)", color: "#1d4ed8" },
  OBSERVATEUR: { bg: "rgba(234,179,8,0.1)", color: "#92400e" },
  CONTROLEUR: { bg: "rgba(59,130,246,0.1)", color: "#1d4ed8" },
  MEMBRE: { bg: "#F3F4F6", color: "#4B5563" },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonBlock({ h, w = "100%" }: { h: number; w?: string | number }) {
  return (
    <div
      className="animate-pulse"
      style={{ height: h, width: w, background: "#E2E8F0", borderRadius: 8 }}
    />
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, type }: { status: string; type: CommissionType }) {
  const styles =
    type === "evaluation"
      ? (STATUS_STYLES.evaluation as Record<string, any>)[status] || STATUS_STYLES.evaluation.BROUILLON
      : (STATUS_STYLES.marche as Record<string, any>)[status] || STATUS_STYLES.marche.EN_COURS;

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 999,
        background: styles.bg,
        color: styles.color,
      }}
    >
      {styles.label}
    </span>
  );
}

// ── Role Badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const style = (ROLE_COLORS as Record<string, any>)[role] || ROLE_COLORS.MEMBRE;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 6,
        background: style.bg,
        color: style.color,
        display: "inline-block",
      }}
    >
      {role}
    </span>
  );
}

// ── Format date ───────────────────────────────────────────────────────────────
function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyMembers({ isAr }: { isAr: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-500">{isAr ? "لا يوجد أعضاء" : "Aucun membre"}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CommissionDetailsPage({ locale, commissionId }: Props) {
  const isAr = locale === "ar";
  const [commissionType, setCommissionType] = useState<CommissionType | null>(null);

  // Try both evaluation and marche queries
  const { data: evalCommission, isLoading: evalLoading, isError: evalError } = useCommissionEvaluationQuery(commissionId);
  const { data: marcheCommission, isLoading: marcheLoading, isError: marcheError } = useCommissionMarcheQuery(commissionId);

  // Determine type based on successful fetch
  useEffect(() => {
    if (!evalLoading && !marcheLoading) {
      if (evalCommission && !evalError) {
        setCommissionType("evaluation");
      } else if (marcheCommission && !marcheError) {
        setCommissionType("marche");
      }
    }
  }, [evalCommission, marcheCommission, evalLoading, marcheLoading, evalError, marcheError]);

  const commission = commissionType === "evaluation" ? evalCommission : marcheCommission;
  const isLoading = commissionType === "evaluation" ? evalLoading : marcheLoading;

  // Fetch members based on type
  const { data: evalMembers = [] } = useMembresEvaluationQuery(
    commissionType === "evaluation" ? commissionId : ""
  );
  const { data: marcheMembers = [] } = useMembersMarcheQuery(
    commissionType === "marche" ? commissionId : ""
  );

  const members = commissionType === "evaluation" ? evalMembers : marcheMembers;

  // Loading state
  if (isLoading || !commissionType || !commission) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <SkeletonBlock h={24} w={200} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <SkeletonBlock h={100} />
          <SkeletonBlock h={100} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <SkeletonBlock h={200} />
        </div>
      </div>
    );
  }

  // Get display data based on type
  const getTitle = () => {
    if (commissionType === "evaluation") {
      return (evalCommission as CommissionEvaluation).objet;
    } else {
      return (marcheCommission as CommissionMarche).intitule;
    }
  };

  const getReference = () => {
    return commission.reference;
  };

  const getStatus = () => {
    return commission.statut;
  };

  const getCreationDate = () => {
    if (commissionType === "evaluation") {
      return (evalCommission as CommissionEvaluation).dateCreation;
    } else {
      return (marcheCommission as CommissionMarche).dateCreation;
    }
  };

  const getAdditionalInfo = () => {
    if (commissionType === "evaluation") {
      const evaluationComm = evalCommission as CommissionEvaluation;
      return [
        { label: isAr ? "ملاحظات" : "Observations", value: evaluationComm.observations || "-" },
        { label: isAr ? "تاريخ الاجتماع" : "Date réunion", value: evaluationComm.dateReunion ? formatDate(evaluationComm.dateReunion, locale) : "-" },
      ];
    } else {
      const marcheComm = marcheCommission as any;
      return [
        { label: isAr ? "نوع السوق" : "Type marché", value: marcheComm.typeMarche || "-" },
        { label: isAr ? "المبلغ المقدر" : "Montant estimé", value: marcheComm.montantEstime ? `${(marcheComm.montantEstime as number).toLocaleString()}` : "-" },
        { label: isAr ? "عدد المتنافسين" : "Soumissionnaires", value: marcheComm.soumissionnairesCount || 0 },
        { label: isAr ? "تاريخ الافتتاح" : "Date ouverture", value: marcheComm.dateOuvertureOffres ? formatDate(marcheComm.dateOuvertureOffres, locale) : "-" },
      ];
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/dashboard/commission`}
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {isAr ? "العودة" : "Retour"}
          </Link>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
            <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              {getReference()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {commissionType === "evaluation" ? "Commission d'évaluation" : "Commission de marché"}
          </p>
        </div>
        <StatusBadge status={getStatus()} type={commissionType} />
      </div>

      {/* ── Info cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {isAr ? "تاريخ الإنشاء" : "Date création"}
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(getCreationDate(), locale)}</p>
        </div>

        {getAdditionalInfo().slice(0, 1).map((info, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{info.label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-2 truncate">{info.value}</p>
          </div>
        ))}
      </div>

      {/* ── Additional info ───────────────────────────────────────────────── */}
      {getAdditionalInfo().length > 1 && (
        <div className="grid grid-cols-2 gap-4">
          {getAdditionalInfo()
            .slice(1)
            .map((info, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{info.label}</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">{info.value}</p>
              </div>
            ))}
        </div>
      )}

      {/* ── Members Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isAr ? "أعضاء اللجنة" : "Membres de la commission"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} {members.length > 1 ? (isAr ? "أعضاء" : "membre") : (isAr ? "عضو" : "membre")}
          </p>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-8">
            <EmptyMembers isAr={isAr} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {isAr ? "الاسم الكامل" : "Nom complet"}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {isAr ? "الدور" : "Rôle"}
                  </th>
                  {commissionType === "marche" && (
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {isAr ? "الوظيفة" : "Fonction"}
                    </th>
                  )}
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {isAr ? "تاريخ التعيين" : "Date nomination"}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {isAr ? "الحالة" : "Statut"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.prenom} {member.nom}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    {commissionType === "marche" && (
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {(member as any).fonction || "-"}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.dateNomination ? formatDate(member.dateNomination, locale) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: member.actif ? "rgba(76,175,80,0.1)" : "#F3F4F6",
                          color: member.actif ? "#2e7d32" : "#6B7280",
                          display: "inline-block",
                        }}
                      >
                        {member.actif ? (isAr ? "نشط" : "Actif") : (isAr ? "غير نشط" : "Inactif")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
