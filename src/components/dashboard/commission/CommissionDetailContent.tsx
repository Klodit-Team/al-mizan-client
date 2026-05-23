"use client";

import Link from "next/link";
import {
  useCommissionEvaluationQuery,
  useMembresEvaluationQuery,
  useSeancesOuvertureQuery,
  useDemarrerSeanceMutation,
  useGeneratePVMutation,
} from "@/services/commission-dashboard/queries";
import { downloadPV } from "@/services/commission-dashboard/api";

interface CommissionDetailDict {
  backLabel: string;
  statusActive: string;
  pageHeaderTitle: string;
  pageMainTitle: string;
  linkedTo: string;
  procurementObject: string;
  membersTitle: string;
  membersSubtitle: string;
  sessionsTitle: string;
  sessionsSubtitle: string;
  technicalSessionStatus: string;
  technicalSessionLabel: string;
  downloadPV: string;
  financialSessionStatus: string;
  financialSessionLabel: string;
  requiresAllMembers: string;
  accessSession: string;
  informationPanelTitle: string;
  informationPanelDateCreation: string;
  informationPanelMembers: string;
  informationPanelPhase: string;
  openingPhase: string;
  currentFlowTitle: string;
  currentFlowStep1: string;
  currentFlowStep2: string;
  currentFlowStep3: string;
}

interface Props {
  locale: string;
  commissionId: string;
  dict: CommissionDetailDict;
}

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  PRESIDENT:   { bg: "rgba(76,175,80,0.1)",   color: "#2e7d32" },
  RAPPORTEUR:  { bg: "rgba(59,130,246,0.1)",  color: "#1d4ed8" },
  OBSERVATEUR: { bg: "rgba(234,179,8,0.1)",   color: "#92400e" },
  MEMBRE:      { bg: "#F3F4F6",               color: "#4B5563" },
};

const STATUT_SEANCE: Record<string, { bg: string; color: string; fr: string; ar: string }> = {
  TERMINEE:   { bg: "rgba(76,175,80,0.1)",  color: "#2e7d32", fr: "Terminée",   ar: "مكتملة"  },
  EN_COURS:   { bg: "rgba(234,179,8,0.1)",  color: "#92400e", fr: "En cours",   ar: "جارية"   },
  PROGRAMMEE: { bg: "#F3F4F6",              color: "#6B7280", fr: "Programmée", ar: "مجدولة"  },
};

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(
    locale === "ar" ? "ar-DZ" : "fr-DZ",
    { day: "2-digit", month: "long", year: "numeric" }
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonBlock({ h, w = "100%" }: { h: number; w?: string }) {
  return (
    <div
      className="animate-pulse"
      style={{ height: h, width: w, background: "#F1F5F9", borderRadius: 8 }}
    />
  );
}

// ── Membres vides ─────────────────────────────────────────────────────────────
function EmptyMembres({ isAr }: { isAr: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-500">
        {isAr ? "لا يوجد أعضاء" : "Aucun membre"}
      </p>
      <p className="text-xs text-slate-400">
        {isAr ? "لم يتم تعيين أعضاء لهذه اللجنة بعد" : "Aucun membre n'a encore été désigné pour cette commission"}
      </p>
    </div>
  );
}

// ── Séances vides ─────────────────────────────────────────────────────────────
function EmptySeances({ isAr }: { isAr: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M16 2v4M8 2v4M3 10h18" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-500">
        {isAr ? "لا توجد جلسات" : "Aucune séance"}
      </p>
      <p className="text-xs text-slate-400">
        {isAr ? "لم يتم برمجة أي جلسة لهذه اللجنة بعد" : "Aucune séance n'a encore été programmée"}
      </p>
    </div>
  );
}

export default function CommissionDetailContent({ locale, commissionId, dict }: Props) {
  const isAr = locale === "ar";

  // ── Données live ────────────────────────────────────────────────────────────
  const { data: commission, isLoading: loadingCommission } =
    useCommissionEvaluationQuery(commissionId);
  const { data: membres, isLoading: loadingMembres } =
    useMembresEvaluationQuery(commissionId);

  const aoId = commission?.id ?? commissionId;
  const { data: allSeances } = useSeancesOuvertureQuery();
  const seancesLiees = (allSeances ?? []).filter((s) => s.appelOffreId === aoId);

  const seanceActive =
    seancesLiees.find((s) => s.statut === "EN_COURS") ??
    seancesLiees.find((s) => s.statut === "PROGRAMMEE") ??
    seancesLiees[0];

  const demarrerMutation = useDemarrerSeanceMutation(seanceActive?.id ?? "");
  const generatePVMutation = useGeneratePVMutation(seanceActive?.id ?? "");

  const handleDownloadPV = async (seanceId: string, pvUrl?: string) => {
    if (pvUrl) { window.open(pvUrl, "_blank"); return; }
    await generatePVMutation.mutateAsync().catch(() => null);
    await downloadPV(seanceId);
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loadingCommission) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="flex items-center gap-3">
          <SkeletonBlock h={32} w="80px" />
          <SkeletonBlock h={32} w="100px" />
        </div>
        <SkeletonBlock h={120} />
        <div className="grid gap-6 md:grid-cols-[1.35fr_0.65fr]">
          <SkeletonBlock h={280} />
          <SkeletonBlock h={200} />
        </div>
      </div>
    );
  }

  // Statut badge styles
  const statutBg =
    commission?.statut === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : commission?.statut === "CLOTUREE"
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-100";

  const statutLabel =
    commission?.statut === "ACTIVE"   ? (isAr ? "نشطة"   : "Active")   :
    commission?.statut === "CLOTUREE" ? (isAr ? "مغلقة"  : "Clôturée") :
    commission?.statut === "ANNULEE"  ? (isAr ? "ملغاة"  : "Annulée")  :
    (commission?.statut ?? "—");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>

      {/* Back + status */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${locale}/dashboard/commission`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 shadow-sm">
            <svg className="w-4 h-4" style={{ transform: isAr ? "rotate(180deg)" : "none" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          {dict.backLabel ?? (isAr ? "رجوع" : "Retour")}
        </Link>
        {commission && (
          <div className={`rounded-3xl border px-4 py-2 text-sm font-semibold shadow-sm ${statutBg}`}>
            {statutLabel}
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="rounded-4xl border border-slate-200 bg-linear-to-r from-slate-50 via-white to-slate-50 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400 mb-2">
              {dict.pageHeaderTitle ?? (isAr ? "لجنة التقييم" : "Commission d'évaluation")}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              {commission?.objet ?? "—"}
            </h1>
            <p className="text-base text-slate-500 mt-3">
              {commission?.reference ?? commissionId}
              {commission?.dateCreation && <> · {formatDate(commission.dateCreation, locale)}</>}
              {commission?.dateReunion && (
                <> · {isAr ? "اجتماع:" : "Réunion :"} {formatDate(commission.dateReunion, locale)}</>
              )}
            </p>
            {commission?.observations && (
              <p className="text-sm text-slate-400 mt-2 italic">{commission.observations}</p>
            )}
          </div>
          <div className="rounded-3xl bg-[#4CAF50] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 shrink-0">
            {statutLabel}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 md:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">

          {/* ── Membres ── */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {dict.membersTitle ?? (isAr ? "أعضاء اللجنة" : "Membres de la commission")}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {dict.membersSubtitle ?? (isAr ? "التشكيلة الرسمية" : "Composition officielle")}
                </p>
              </div>
              {loadingMembres && (
                <span className="text-xs text-slate-400 animate-pulse">
                  {isAr ? "جارٍ التحميل…" : "Chargement…"}
                </span>
              )}
            </div>

            {loadingMembres ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((i) => <SkeletonBlock key={i} h={72} />)}
              </div>
            ) : membres && membres.filter((m) => m.actif).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {membres.filter((m) => m.actif).map((membre) => {
                  const rs = ROLE_COLOR[membre.role] ?? ROLE_COLOR["MEMBRE"];
                  return (
                    <div key={membre.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {membre.prenom} {membre.nom}
                      </p>
                      <span
                        style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: rs.bg, color: rs.color }}
                      >
                        {membre.role}
                      </span>
                      {membre.dateNomination && (
                        <p className="text-xs text-slate-400 mt-2">
                          {formatDate(membre.dateNomination, locale)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyMembres isAr={isAr} />
            )}
          </section>

          {/* ── Séances ── */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                {dict.sessionsTitle ?? (isAr ? "جلسات الفتح" : "Séances d'ouverture")}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {dict.sessionsSubtitle ?? (isAr ? "إدارة جلسات فتح الأظرفة" : "Gestion des séances d'ouverture des plis")}
              </p>
            </div>

            {seancesLiees.length === 0 ? (
              <EmptySeances isAr={isAr} />
            ) : (
              <div className="space-y-4">
                {seancesLiees.map((seance) => {
                  const ss = STATUT_SEANCE[seance.statut] ?? STATUT_SEANCE["PROGRAMMEE"];
                  const seanceLabel = isAr ? ss.ar : ss.fr;
                  const isEnCours = seance.statut === "EN_COURS";
                  const isTerminee = seance.statut === "TERMINEE";

                  return (
                    <div
                      key={seance.id}
                      className={`rounded-3xl border p-5 ${isEnCours ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className={`text-sm font-semibold ${isEnCours ? "text-amber-900" : "text-slate-900"}`}>
                              {isAr ? "جلسة فتح الأظرفة" : "Séance d'ouverture des plis"}
                            </p>
                            <span
                              style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: ss.bg, color: ss.color, fontWeight: 600 }}
                            >
                              {seanceLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(seance.dateSeance, locale)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0">
                          {isTerminee && (
                            <button
                              onClick={() => handleDownloadPV(seance.id, seance.pvUrl)}
                              disabled={generatePVMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V19a2 2 0 002 2h14a2 2 0 002-2v-2" />
                              </svg>
                              {generatePVMutation.isPending ? "…" : (dict.downloadPV ?? (isAr ? "تحميل المحضر" : "Télécharger PV"))}
                            </button>
                          )}

                          {seance.statut === "PROGRAMMEE" && (
                            <button
                              onClick={() => demarrerMutation.mutate()}
                              disabled={demarrerMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-2xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white hover:bg-[#43A047] transition disabled:opacity-60"
                            >
                              {demarrerMutation.isPending ? "…" : (isAr ? "بدء الجلسة" : "Démarrer")}
                            </button>
                          )}

                          {isEnCours && (
                            <Link
                              href={`/${locale}/dashboard/commission/${commissionId}/mes-commissions/${aoId}/pre-dechiffrement`}
                              className="inline-flex items-center gap-2 rounded-2xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#43A047] transition"
                            >
                              {dict.accessSession ?? (isAr ? "الدخول إلى الجلسة" : "Accéder à la séance")}
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Aside ── */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {dict.informationPanelTitle ?? (isAr ? "معلومات" : "Informations")}
            </h3>
            <dl className="space-y-3 text-sm text-slate-600">
              {commission?.dateCreation && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{isAr ? "تاريخ الإنشاء" : "Création"}</dt>
                  <dd className="font-medium">{formatDate(commission.dateCreation, locale)}</dd>
                </div>
              )}
              {commission?.dateReunion && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{isAr ? "تاريخ الاجتماع" : "Réunion"}</dt>
                  <dd className="font-medium">{formatDate(commission.dateReunion, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-400">{isAr ? "عدد الأعضاء" : "Membres actifs"}</dt>
                <dd className="font-medium">
                  {loadingMembres ? "…" : (membres?.filter((m) => m.actif).length ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{isAr ? "عدد الجلسات" : "Séances"}</dt>
                <dd className="font-medium">{seancesLiees.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{isAr ? "المرحلة" : "Phase"}</dt>
                <dd className="font-medium">
                  {commission?.statut === "ACTIVE" ? (isAr ? "فتح الأظرفة" : "Ouverture") : statutLabel}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900 mb-4">
              {dict.currentFlowTitle ?? (isAr ? "مسار الإجراءات" : "Processus en cours")}
            </p>
            <ol className="space-y-3 text-sm text-slate-600">
              {[
                dict.currentFlowStep1 ?? (isAr ? "فتح الأظرفة"     : "Ouverture des plis"),
                dict.currentFlowStep2 ?? (isAr ? "التقييم التقني"   : "Évaluation technique"),
                dict.currentFlowStep3 ?? (isAr ? "التصنيف النهائي" : "Classement final"),
              ].map((step, i) => (
                <li key={i} className="rounded-2xl bg-white p-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}