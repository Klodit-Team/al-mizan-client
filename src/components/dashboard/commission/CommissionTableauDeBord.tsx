"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useMesCommissionsQuery,
  useSeancesOuvertureQuery,
} from "@/services/commission-dashboard/queries";
import type { SeanceOuverture, CommissionEvaluation } from "@/services/commission-dashboard/api";

interface Props {
  locale: string;
  userId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d: string, locale: string) {
  return new Date(d).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    // Evaluation
    ACTIVE:    { label: "Active",     bg: "rgba(76,175,80,0.1)",   color: "#2e7d32"  },
    BROUILLON: { label: "Brouillon",  bg: "rgba(234,179,8,0.1)",   color: "#92400e"  },
    CLOTUREE:  { label: "Clôturée",   bg: "#F1F5F9",               color: "#475569"  },
    // Marche
    EN_COURS:     { label: "En cours",     bg: "rgba(76,175,80,0.1)",   color: "#2e7d32"  },
    DELIBERATION: { label: "Délibération", bg: "rgba(234,179,8,0.1)",   color: "#92400e"  },
    ATTRIBUEE:    { label: "Attribuée",    bg: "rgba(76,175,80,0.1)",   color: "#2e7d32"  },
    INFRUCTUEUSE: { label: "Infructueuse", bg: "rgba(239,68,68,0.08)",  color: "#dc2626"  },
    ANNULEE:   { label: "Annulée",    bg: "rgba(239,68,68,0.08)",  color: "#dc2626"  },
  };
  const s = map[statut] ?? { label: statut, bg: "#F1F5F9", color: "#475569" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ h, w = "100%", r = 8 }: { h: number; w?: string | number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ height: h, width: w, borderRadius: r, background: "#F1F5F9", flexShrink: 0 }}
    />
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "orange" | "green" | "slate";
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ label, value, sub, accent = "slate", icon, loading }: StatCardProps) {
  const styles = {
    orange: { border: "#FED7AA", bg: "#FFF7ED", iconBg: "rgba(249,115,22,0.12)", iconColor: "#EA580C", valueColor: "#C2410C" },
    green:  { border: "#BBF7D0", bg: "#F0FDF4", iconBg: "rgba(76,175,80,0.12)",  iconColor: "#15803D", valueColor: "#15803D" },
    slate:  { border: "#E2E8F0", bg: "#fff",    iconBg: "#F8FAFC",                iconColor: "#64748B", valueColor: "#364150" },
  };
  const s = styles[accent];

  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 24, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: s.iconColor }}>
          {icon}
        </div>
        {sub && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: s.iconBg, color: s.iconColor }}>
            {sub}
          </span>
        )}
      </div>
      {loading ? (
        <>
          <Skeleton h={36} w={80} />
          <Skeleton h={14} w="60%" />
        </>
      ) : (
        <>
          <p style={{ fontSize: 36, fontWeight: 900, color: s.valueColor, margin: 0, letterSpacing: "-0.02em" }}>{value}</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#64748B", margin: 0 }}>{label}</p>
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CommissionTableauDeBord({ locale, userId }: Props) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"evaluation" | "seance">("evaluation");

  const { data, isLoading } = useMesCommissionsQuery(userId);
  const { data: seances, isLoading: loadingSeances } = useSeancesOuvertureQuery();

  const commissions = data?.commissionsEvaluation ?? [];

  const getCommissionIdForSeance = (seance: SeanceOuverture) => {
    return seance.commissionId || commissions.find((c: CommissionEvaluation) => c.aoId === seance.appelOffreId || c.appelOffreId === seance.appelOffreId)?.id || userId;
  };
  const actives   = commissions.filter(c => c.statut === "ACTIVE");
  const cloturees = commissions.filter(c => c.statut === "CLOTUREE");

  const seancesEnCours    = (seances ?? []).filter(s => s.statut === "EN_COURS");
  const seancesProgrammees = (seances ?? []).filter(s => s.statut === "PROGRAMMEE");

  // Prochaine séance
  const prochaineSeance = [...seancesProgrammees].sort(
    (a, b) => new Date(a.dateSeance).getTime() - new Date(b.dateSeance).getTime()
  )[0];

  // Progression globale estimée
  const progressionGlobale = commissions.length === 0 ? 0
    : Math.round((cloturees.length / commissions.length) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">
            {isAr ? "لوحة التحكم" : "Tableau de bord"}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isAr ? "لجنة التقييم" : "Commission d'évaluation"}
          </h1>
        </div>
        <Link
          href={`/${locale}/dashboard/commission/mes-commissions`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4CAF50] text-white text-sm font-semibold shadow-md hover:bg-[#43A047] transition-all hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {isAr ? "كل اللجان" : "Mes commissions"}
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-5">
        <StatCard
          loading={isLoading}
          accent="orange"
          value={actives.length}
          label={isAr ? "لجان التقييم النشطة" : "Commissions en cours"}
          sub={isAr ? "نشطة" : "En cours"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          loading={isLoading}
          accent="slate"
          value={seancesEnCours.length + seancesProgrammees.length}
          label={isAr ? "جلسات الفتح المجدولة" : "Séances d'ouverture"}
          sub={seancesEnCours.length > 0 ? (isAr ? "جارية" : "En cours") : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          loading={isLoading}
          accent="green"
          value={cloturees.length}
          label={isAr ? "عمليات التقييم المكتملة" : "Évaluations clôturées"}
          sub={isAr ? "مكتملة" : "Clôturées"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Body : table + aside ────────────────────────────────────────────── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 288px" }}>

        {/* ── Table des commissions ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header + tabs */}
          <div className="px-6 pt-5 pb-0 flex items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isAr ? "لجاني" : "Mes commissions"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? "قائمة اللجان المعينة لك" : "Liste des commissions qui vous sont assignées"}
              </p>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {(["evaluation", "seance"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "evaluation"
                    ? (isAr ? "لجان التقييم" : "Évaluations")
                    : (isAr ? "جلسات الفتح" : "Séances")}
                </button>
              ))}
            </div>
          </div>

          {/* Table content */}
          {activeTab === "evaluation" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      isAr ? "المرجع" : "Référence",
                      isAr ? "الموضوع" : "Objet",
                      isAr ? "الحالة" : "Statut",
                      isAr ? "تاريخ الإنشاء" : "Créée le",
                      isAr ? "إجراء" : "Action",
                    ].map(col => (
                      <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <Skeleton h={14} w={`${50 + (j * 15) % 35}%`} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : commissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-slate-400">
                            {isAr ? "لا توجد لجان بعد" : "Aucune commission assignée"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                            {c.reference}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-[200px]">
                          <p className="text-sm font-semibold text-slate-800 truncate">{c.objet}</p>
                          {c.dateReunion && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {isAr ? "اجتماع:" : "Réunion :"} {formatDate(c.dateReunion, locale)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatutBadge statut={c.statut} />
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {formatDate(c.dateCreation, locale)}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/${locale}/dashboard/commission/${c.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4CAF50] text-white text-xs font-semibold hover:bg-[#43A047] transition-colors"
                          >
                            {isAr ? "عرض" : "Voir"}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Séances tab */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      isAr ? "رقم الطلب" : "Appel d'offre",
                      isAr ? "تاريخ الجلسة" : "Date",
                      isAr ? "الحالة" : "Statut",
                      isAr ? "إجراء" : "Action",
                    ].map(col => (
                      <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingSeances ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-5 py-4"><Skeleton h={14} w="70%" /></td>
                        ))}
                      </tr>
                    ))
                  ) : (seances ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-slate-400">
                            {isAr ? "لا توجد جلسات مجدولة" : "Aucune séance programmée"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (seances ?? []).map((s) => {
                      const sMap: Record<string, { label: string; bg: string; color: string }> = {
                        PROGRAMMEE: { label: isAr ? "مجدولة" : "Programmée", bg: "#F1F5F9",              color: "#64748B" },
                        EN_COURS:   { label: isAr ? "جارية" : "En cours",    bg: "rgba(234,179,8,0.1)", color: "#92400e" },
                        TERMINEE:   { label: isAr ? "مكتملة" : "Terminée",   bg: "rgba(76,175,80,0.1)", color: "#15803D" },
                      };
                      const ss = sMap[s.statut] ?? sMap["PROGRAMMEE"];
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                              {s.appelOffreId.slice(0, 16)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700">
                            {formatDate(s.dateSeance, locale)}
                          </td>
                          <td className="px-5 py-4">
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: ss.bg, color: ss.color }}>
                              {ss.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {s.statut !== "TERMINEE" && (
                              <Link
                                href={`/${locale}/dashboard/commission/${getCommissionIdForSeance(s)}/mes-commissions/${s.appelOffreId}/pre-dechiffrement`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4CAF50] text-white text-xs font-semibold hover:bg-[#43A047] transition-colors"
                              >
                                {isAr ? "الدخول" : "Accéder"}
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Aside ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Progression globale */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">
                {isAr ? "التقدم الإجمالي" : "Progression globale"}
              </h3>
              {!isLoading && (
                <span className="text-xs font-semibold text-[#4CAF50]">
                  {progressionGlobale}%
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton h={8} r={4} />
                <Skeleton h={14} w="60%" />
              </div>
            ) : commissions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-full h-2 rounded-full bg-slate-100" />
                <p className="text-xs text-slate-400">
                  {isAr ? "لا توجد بيانات بعد" : "Aucune donnée disponible"}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full h-2 rounded-full bg-slate-100 mb-4">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${progressionGlobale}%`, background: "linear-gradient(90deg, #4CAF50, #81C784)" }}
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { label: isAr ? "مكتملة" : "Clôturées",   count: cloturees.length,  color: "#4CAF50" },
                    { label: isAr ? "نشطة" : "En cours",       count: actives.length,    color: "#F97316" },
                    { label: isAr ? "الإجمالي" : "Total",      count: commissions.length, color: "#94A3B8" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, display: "inline-block" }} />
                        <span className="text-slate-500">{row.label}</span>
                      </div>
                      <span className="font-bold text-slate-700">{row.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Prochaine séance */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex-1">
            <h3 className="text-sm font-bold text-slate-900 mb-5">
              {isAr ? "الجلسة القادمة" : "Prochaine séance"}
            </h3>

            {loadingSeances ? (
              <div className="space-y-3">
                <Skeleton h={16} w="80%" />
                <Skeleton h={14} w="60%" />
                <Skeleton h={36} r={12} />
              </div>
            ) : !prochaineSeance ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-center text-slate-400">
                  {isAr ? "لا توجد جلسات مجدولة" : "Aucune séance programmée"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                  <p className="text-xs text-slate-400 mb-1">
                    {isAr ? "رقم الطلب" : "Appel d'offre"}
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-700">
                    {prochaineSeance.appelOffreId}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-slate-600 font-semibold">
                      {formatDate(prochaineSeance.dateSeance, locale)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/dashboard/commission/${getCommissionIdForSeance(prochaineSeance)}/mes-commissions/${prochaineSeance.appelOffreId}/pre-dechiffrement`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#364150] text-white text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  {isAr ? "الدخول إلى الجلسة" : "Accéder à la séance"}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {seancesEnCours.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <p className="text-xs text-amber-700 font-semibold">
                      {seancesEnCours.length} {isAr ? "جلسة جارية" : `séance${seancesEnCours.length > 1 ? "s" : ""} en cours`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
